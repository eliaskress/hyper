import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateAmplificationHI, AMPLIFICATION } from "@/lib/hi";
import {
  getAmplificationsByPost,
  getCreatorAmplificationTotal,
  createPropagationEvent,
  createNotification,
} from "@/lib/db/queries";
import { db } from "@/lib/db";
import { posts, assignments, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

const schema = z.object({
  postId: z.string().uuid(),
  amplifierCreatorId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { postId, amplifierCreatorId } = parsed.data;

    // Get the post with assignment info
    const [postRow] = await db
      .select({
        id: posts.id,
        hiCalculated: posts.hiCalculated,
        assignmentId: posts.assignmentId,
        creatorId: assignments.creatorId,
        briefingId: assignments.briefingId,
        creatorHandle: users.handle,
      })
      .from(posts)
      .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
      .innerJoin(users, eq(assignments.creatorId, users.id))
      .where(eq(posts.id, postId));

    if (!postRow) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (!postRow.hiCalculated) {
      return NextResponse.json(
        { error: "Post has not been measured yet", code: "NOT_MEASURED" },
        { status: 409 },
      );
    }

    // Cannot amplify your own post
    if (postRow.creatorId === amplifierCreatorId) {
      return NextResponse.json(
        { error: "Cannot amplify your own post", code: "SELF_AMPLIFICATION" },
        { status: 400 },
      );
    }

    // Check max 5 amplifiers per post
    const ampCount = await getAmplificationsByPost(postId);
    if (ampCount >= AMPLIFICATION.maxAmplifiersPerPost) {
      return NextResponse.json(
        { error: "Maximum amplifiers reached for this post", code: "MAX_AMPLIFIERS" },
        { status: 409 },
      );
    }

    // Check 50% cap: amplifier's total amp HI in this campaign cannot exceed 50% of their own HI
    const ampTotal = await getCreatorAmplificationTotal(amplifierCreatorId, postRow.briefingId);
    const originalHi = parseFloat(postRow.hiCalculated);
    const ampHi = calculateAmplificationHI(originalHi);

    // Get amplifier's own HI in this campaign
    const [ownHi] = await db
      .select({ total: sql<string>`COALESCE(sum(${posts.hiCalculated}), '0')` })
      .from(posts)
      .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
      .where(
        and(
          eq(assignments.creatorId, amplifierCreatorId),
          eq(assignments.briefingId, postRow.briefingId),
          sql`${posts.hiCalculated} IS NOT NULL`,
        ),
      );

    const ownHiTotal = parseFloat(ownHi?.total ?? "0");
    const maxAmpHi = ownHiTotal * (AMPLIFICATION.maxAmplificationPercent / 100);

    // If amplifier has own HI in this campaign, enforce the cap
    if (ownHiTotal > 0 && ampTotal + ampHi > maxAmpHi) {
      return NextResponse.json(
        { error: "Amplification would exceed 50% cap of your own HI in this campaign", code: "AMP_CAP_EXCEEDED" },
        { status: 409 },
      );
    }

    // Create propagation event
    const event = await createPropagationEvent({
      type: "amplification",
      sourceCreatorId: amplifierCreatorId,
      targetCreatorId: postRow.creatorId,
      sourcePostId: postId,
      briefingId: postRow.briefingId,
      hiAmount: ampHi.toFixed(2),
    });

    // Notify original creator
    const [amplifier] = await db
      .select({ handle: users.handle })
      .from(users)
      .where(eq(users.id, amplifierCreatorId));

    await createNotification({
      userId: postRow.creatorId,
      type: "amplification_received",
      title: `${amplifier?.handle ?? "Someone"} amplified your post`,
      body: `${amplifier?.handle ?? "A creator"} amplified your post. You earned +${ampHi.toFixed(1)} HI from this amplification.`,
      metadata: { postId, amplifierCreatorId, hi: ampHi },
    });

    return NextResponse.json({
      propagationEvent: event,
      hiAwarded: ampHi,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
