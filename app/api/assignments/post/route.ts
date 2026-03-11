import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assignments, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const schema = z.object({
  assignmentId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  postUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Provide a valid assignment ID and post URL.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { assignmentId, postUrl } = parsed.data;

    // Verify assignment exists and is in a valid state for post submission
    const [assignment] = await db
      .select({ id: assignments.id, status: assignments.status })
      .from(assignments)
      .where(eq(assignments.id, assignmentId));

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (!["accepted", "scheduled"].includes(assignment.status)) {
      return NextResponse.json(
        { error: "Post link can only be submitted for accepted or scheduled assignments", code: "INVALID_STATUS" },
        { status: 409 },
      );
    }

    // Create the post record
    const [post] = await db
      .insert(posts)
      .values({
        assignmentId,
        postUrl,
        platform: "instagram",
        postedAt: new Date(),
      })
      .returning();

    // Move assignment to "posted" status
    await db
      .update(assignments)
      .set({ status: "posted" })
      .where(eq(assignments.id, assignmentId));

    return NextResponse.json({ post, status: "posted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
