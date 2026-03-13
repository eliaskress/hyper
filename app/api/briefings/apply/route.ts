import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getBriefingById,
  getCreatorOpenAssignment,
  createSelfAssignment,
} from "@/lib/db/queries";

const schema = z.object({
  briefingId: z.string().uuid(),
  creatorId: z.string().uuid(),
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

    const { briefingId, creatorId } = parsed.data;

    // Validate briefing exists, is active, and is open
    const briefing = await getBriefingById(briefingId);
    if (!briefing) {
      return NextResponse.json(
        { error: "Briefing not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    if (briefing.status !== "active") {
      return NextResponse.json(
        { error: "Briefing is not active", code: "INVALID_STATUS" },
        { status: 409 },
      );
    }
    if (briefing.visibility !== "open") {
      return NextResponse.json(
        { error: "Briefing is not open for self-assignment", code: "NOT_OPEN" },
        { status: 403 },
      );
    }

    // Check for duplicate assignment
    const existing = await getCreatorOpenAssignment(creatorId, briefingId);
    if (existing) {
      return NextResponse.json(
        { error: "You have already accepted this campaign", code: "DUPLICATE" },
        { status: 409 },
      );
    }

    // Create assignment with status 'accepted'
    const assignment = await createSelfAssignment({ briefingId, creatorId });

    // Notify brand (using the brand's user ID from the briefing)
    // For now we skip brand notification since we'd need to look up the brand user

    return NextResponse.json({ assignment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
