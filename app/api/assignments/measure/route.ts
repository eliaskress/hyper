import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateHI, calculatePayout, calculateHIG } from "@/lib/hi";
import {
  getAssignmentById,
  getPostByAssignmentId,
  updatePostMetrics,
  updateAssignmentStatus,
  updateBriefingHiDelivered,
  createPayout,
  getCreatorHIGData,
  updateCreatorHIG,
} from "@/lib/db/queries";

const schema = z.object({
  assignmentId: z.string().uuid(),
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  saves: z.number().int().min(0),
  shares: z.number().int().min(0),
  reach: z.number().int().min(1, "Reach must be at least 1"),
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

    const { assignmentId, likes, comments, saves, shares, reach } = parsed.data;

    // Validate assignment exists and is in "posted" status
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    if (assignment.status !== "posted") {
      return NextResponse.json(
        { error: "Assignment must be in 'posted' status to measure", code: "INVALID_STATUS" },
        { status: 409 },
      );
    }

    // Get the post record
    const post = await getPostByAssignmentId(assignmentId);
    if (!post) {
      return NextResponse.json(
        { error: "No post found for this assignment", code: "NO_POST" },
        { status: 404 },
      );
    }

    // Calculate HI
    const metrics = { likes, comments, saves, shares, reach };
    const hi = calculateHI(metrics);
    const hiRounded = parseFloat(hi.toFixed(2));

    // Update post with metrics and HI
    await updatePostMetrics(post.id, metrics, hiRounded.toString());

    // Update assignment status to "measured"
    await updateAssignmentStatus(assignmentId, "measured");

    // Increment briefing's hiDelivered
    await updateBriefingHiDelivered(assignment.briefingId, hiRounded);

    // Create payout record
    const payout = calculatePayout(hiRounded);
    await createPayout({
      assignmentId,
      amount: payout.creatorUsd.toFixed(2),
      hiAmount: hiRounded.toString(),
    });

    // Recalculate creator's HIG score
    const higData = await getCreatorHIGData(assignment.creatorId);
    const newHIG = calculateHIG(higData);
    await updateCreatorHIG(assignment.creatorId, newHIG);

    return NextResponse.json({
      hi: hiRounded,
      payout: payout.creatorUsd.toFixed(2),
      higScore: newHIG,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
