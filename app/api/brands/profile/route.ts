import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const schema = z.object({
  brandId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  instagramHandle: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/, "Invalid Instagram handle"),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { brandId, instagramHandle } = parsed.data;

    const [updated] = await db
      .update(brands)
      .set({ instagramHandle })
      .where(eq(brands.id, brandId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Brand not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json({ instagramHandle: updated.instagramHandle });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
