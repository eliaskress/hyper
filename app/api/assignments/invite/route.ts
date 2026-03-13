import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assignments, users, briefings, brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendNewMatchEmail } from "@/lib/email";

const schema = z.object({
  briefingId: z.string().uuid(),
  creatorId: z.string().uuid(),
  allocatedHi: z.string().optional(),
  role: z.enum(["originator", "amplifier"]).default("originator"),
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

    const { briefingId, creatorId, allocatedHi, role } = parsed.data;

    // Get briefing to calculate response due date
    const [briefing] = await db
      .select({
        id: briefings.id,
        responseHours: briefings.responseHours,
        brandId: briefings.brandId,
        contentBrief: briefings.contentBrief,
        offerDescription: briefings.offerDescription,
      })
      .from(briefings)
      .where(eq(briefings.id, briefingId));

    if (!briefing) {
      return NextResponse.json(
        { error: "Briefing not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const now = new Date();
    const responseDueAt = new Date(now.getTime() + (briefing.responseHours ?? 72) * 60 * 60 * 1000);

    const [created] = await db
      .insert(assignments)
      .values({
        briefingId,
        creatorId,
        status: "invited",
        role,
        allocatedHi: allocatedHi ?? null,
        responseDueAt,
      })
      .returning();

    // Send new match email (respects preferences)
    const [creator] = await db
      .select({ handle: users.handle, email: users.email, emailPreferences: users.emailPreferences })
      .from(users)
      .where(eq(users.id, creatorId));

    if (creator?.email && creator.emailPreferences?.newMatches !== false) {
      const [brand] = await db
        .select({ businessName: brands.businessName, address: brands.address })
        .from(brands)
        .where(eq(brands.id, briefing.brandId));

      if (brand) {
        sendNewMatchEmail(creator.email, {
          creatorName: creator.handle,
          restaurantName: brand.businessName,
          address: brand.address ?? "",
          brief: briefing.contentBrief ?? "",
          offer: briefing.offerDescription,
          hoursToRespond: briefing.responseHours ?? 72,
        });
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
