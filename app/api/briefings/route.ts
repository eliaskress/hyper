import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBrandByUserId, getBrandBriefing, createBriefing, updateBriefing } from "@/lib/db/queries";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

const VALID_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const VALID_MEALS = ["breakfast", "lunch", "dinner"];

const postSchema = z.object({
  contentBrief: z.string().min(10, "Content brief must be at least 10 characters"),
  offerDescription: z.string().min(1, "Describe what's included for the creator").optional(),
  availabilityDays: z.array(z.enum(VALID_DAYS as [string, ...string[]])).min(1, "Select at least one day"),
  availabilityMeals: z.array(z.enum(VALID_MEALS as [string, ...string[]])).min(1, "Select at least one meal"),
  budgetHi: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format"),
});

const patchSchema = z.object({
  briefingId: z.string().uuid(),
  contentBrief: z.string().min(10).optional(),
  offerDescription: z.string().optional(),
  availabilityDays: z.array(z.enum(VALID_DAYS as [string, ...string[]])).min(1).optional(),
  availabilityMeals: z.array(z.enum(VALID_MEALS as [string, ...string[]])).min(1).optional(),
  budgetHi: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const brand = await getBrandByUserId(DEMO_USER_ID);
    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Check if brand already has a briefing
    const existing = await getBrandBriefing(brand.id);
    if (existing) {
      return NextResponse.json(
        { error: "Brand already has a briefing. Use PATCH to update.", code: "ALREADY_EXISTS" },
        { status: 409 },
      );
    }

    const briefing = await createBriefing({
      brandId: brand.id,
      contentBrief: parsed.data.contentBrief,
      offerDescription: parsed.data.offerDescription,
      availabilityDays: parsed.data.availabilityDays,
      availabilityMeals: parsed.data.availabilityMeals,
      budgetHi: parsed.data.budgetHi,
    });

    return NextResponse.json(briefing, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { briefingId, ...updates } = parsed.data;

    const updated = await updateBriefing(briefingId, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Briefing not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
