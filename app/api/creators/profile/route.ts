import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateCreatorProfile } from "@/lib/db/queries";

const schema = z.object({
  userId: z.string().uuid(),
  handle: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/, "Invalid handle format").optional(),
  location: z.string().min(1).max(100).optional(),
  primaryPlatform: z.enum(["instagram", "tiktok", "youtube"]).optional(),
  platforms: z.array(z.string().url()).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { userId, ...updates } = parsed.data;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update", code: "NO_UPDATES" },
        { status: 400 },
      );
    }

    const updated = await updateCreatorProfile(userId, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      handle: updated.handle,
      location: updated.location,
      primaryPlatform: updated.primaryPlatform,
      platforms: updated.platforms,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
