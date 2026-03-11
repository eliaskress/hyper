import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApplicationById, updateApplicationStatus } from "@/lib/db/queries";

const updateSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { applicationId, status } = parsed.data;

    const existing = await getApplicationById(applicationId);
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (existing.status !== "applied") {
      return NextResponse.json(
        { error: "Application has already been reviewed", code: "ALREADY_REVIEWED" },
        { status: 409 },
      );
    }

    const updated = await updateApplicationStatus(applicationId, status);
    return NextResponse.json({ application: updated });
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

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented", code: "NOT_IMPLEMENTED" },
    { status: 501 },
  );
}
