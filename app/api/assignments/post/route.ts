import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assignments, posts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAssignmentEmailContext } from "@/lib/db/queries";
import { sendCreatorPostedEmail } from "@/lib/email";

const submitSchema = z.object({
  assignmentId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  postUrl: z.string().url(),
  platform: z.enum(["instagram", "tiktok", "youtube"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Provide a valid assignment ID, post URL, and platform.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { assignmentId, postUrl, platform } = parsed.data;

    // Verify assignment exists and is in a valid state
    const [assignment] = await db
      .select({
        id: assignments.id,
        status: assignments.status,
        selectedPlatforms: assignments.selectedPlatforms,
      })
      .from(assignments)
      .where(eq(assignments.id, assignmentId));

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (!["accepted", "scheduled", "posted"].includes(assignment.status)) {
      return NextResponse.json(
        { error: "Post link can only be submitted for accepted, scheduled, or in-progress assignments", code: "INVALID_STATUS" },
        { status: 409 },
      );
    }

    // Check platform is in selectedPlatforms
    const selected = (assignment.selectedPlatforms as string[]) ?? [];
    if (selected.length > 0 && !selected.includes(platform)) {
      return NextResponse.json(
        { error: `You didn't select ${platform} for this collab`, code: "PLATFORM_NOT_SELECTED" },
        { status: 400 },
      );
    }

    // Check if post already exists for this platform
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.assignmentId, assignmentId), eq(posts.platform, platform)));

    if (existing) {
      return NextResponse.json(
        { error: `A post for ${platform} has already been submitted`, code: "ALREADY_SUBMITTED" },
        { status: 409 },
      );
    }

    // Create the post record
    const [post] = await db
      .insert(posts)
      .values({
        assignmentId,
        postUrl,
        platform,
        postedAt: new Date(),
      })
      .returning();

    // Check if all selected platforms now have posts
    const allPosts = await db
      .select({ platform: posts.platform })
      .from(posts)
      .where(eq(posts.assignmentId, assignmentId));

    const submittedPlatforms = allPosts.map((p) => p.platform);
    const allSubmitted = selected.length > 0
      ? selected.every((p) => submittedPlatforms.includes(p))
      : true;

    // Move to "posted" once all platforms have URLs
    if (allSubmitted) {
      await db
        .update(assignments)
        .set({ status: "posted" })
        .where(eq(assignments.id, assignmentId));
    }

    // Notify restaurant about the post (respects preferences)
    const ctx = await getAssignmentEmailContext(assignmentId);
    if (ctx?.brandEmail && ctx.brandEmailPreferences?.creatorPosted !== false) {
      sendCreatorPostedEmail(ctx.brandEmail, {
        brandName: ctx.brandName,
        creatorHandle: ctx.creatorHandle,
        platform,
        postUrl,
      });
    }

    return NextResponse.json({
      post,
      status: allSubmitted ? "posted" : assignment.status,
      remaining: selected.filter((p) => !submittedPlatforms.includes(p)),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
