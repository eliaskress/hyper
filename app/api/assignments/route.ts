import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAssignmentById } from "@/lib/db/queries";

const patchSchema = z.object({
  assignmentId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  action: z.enum(["accept", "decline", "schedule"]),
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

    const { assignmentId, action, declineReason, scheduledDate, scheduleTimeStart, scheduleTimeEnd } = parsed.data;

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
      const [updated] = await db
        .update(assignments)
        .set({ status: "accepted" })
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
