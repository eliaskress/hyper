import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAssignmentById, getPayoutByAssignmentId, updatePayoutStatus } from "@/lib/db/queries";

const patchSchema = z.object({
  assignmentId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  action: z.enum(["accept", "decline", "schedule", "pay"]),
  selectedPlatforms: z.array(z.enum(["instagram", "tiktok", "youtube"])).min(1).optional(),
  declineReason: z.string().min(1).optional(),
  scheduledDate: z.string().optional(),
  scheduleTimeStart: z.string().optional(),
  scheduleTimeEnd: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Assignment PATCH validation error:", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { assignmentId, action, selectedPlatforms, declineReason, scheduledDate, scheduleTimeStart, scheduleTimeEnd } = parsed.data;

    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (action === "accept") {
      if (assignment.status !== "invited") {
        return NextResponse.json(
          { error: "Can only accept invited assignments", code: "INVALID_STATUS" },
          { status: 409 },
        );
      }
      if (!selectedPlatforms || selectedPlatforms.length === 0) {
        return NextResponse.json(
          { error: "Select at least one platform to post on", code: "NO_PLATFORMS" },
          { status: 400 },
        );
      }
      const [updated] = await db
        .update(assignments)
        .set({ status: "accepted", selectedPlatforms })
        .where(eq(assignments.id, assignmentId))
        .returning();
      return NextResponse.json(updated);
    }

    if (action === "decline") {
      if (assignment.status !== "invited") {
        return NextResponse.json(
          { error: "Can only decline invited assignments", code: "INVALID_STATUS" },
          { status: 409 },
        );
      }
      if (!declineReason) {
        return NextResponse.json(
          { error: "A reason is required to decline", code: "REASON_REQUIRED" },
          { status: 400 },
        );
      }
      const [updated] = await db
        .update(assignments)
        .set({ status: "declined", declineReason })
        .where(eq(assignments.id, assignmentId))
        .returning();
      return NextResponse.json(updated);
    }

    if (action === "schedule") {
      if (!["accepted", "scheduled"].includes(assignment.status)) {
        return NextResponse.json(
          { error: "Can only schedule accepted assignments", code: "INVALID_STATUS" },
          { status: 409 },
        );
      }
      if (!scheduledDate || !scheduleTimeStart) {
        return NextResponse.json(
          { error: "Date and start time are required", code: "MISSING_SCHEDULE" },
          { status: 400 },
        );
      }
      const [updated] = await db
        .update(assignments)
        .set({
          status: "scheduled",
          scheduledDate: new Date(scheduledDate),
          scheduleTypeField: scheduleTimeEnd ? "flexible" : "fixed",
          scheduleTimeStart,
          scheduleTimeEnd: scheduleTimeEnd ?? scheduleTimeStart,
        })
        .where(eq(assignments.id, assignmentId))
        .returning();
      return NextResponse.json(updated);
    }

    if (action === "pay") {
      if (assignment.status !== "measured") {
        return NextResponse.json(
          { error: "Can only pay measured assignments", code: "INVALID_STATUS" },
          { status: 409 },
        );
      }
      const payout = await getPayoutByAssignmentId(assignmentId);
      if (!payout) {
        return NextResponse.json(
          { error: "No payout record found", code: "NO_PAYOUT" },
          { status: 404 },
        );
      }
      // Mark assignment as paid
      const [updated] = await db
        .update(assignments)
        .set({ status: "paid" })
        .where(eq(assignments.id, assignmentId))
        .returning();
      // Update payout status with demo stripe transfer ID
      await updatePayoutStatus(payout.id, "paid", `demo_tr_${Date.now()}`);
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Unknown action", code: "UNKNOWN_ACTION" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Not implemented", code: "NOT_IMPLEMENTED" },
    { status: 501 },
  );
}
