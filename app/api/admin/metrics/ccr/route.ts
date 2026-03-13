import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateCCR } from "@/lib/metrics";

// TODO: Replace with real admin auth check (session, JWT, or role-based)
function isAdmin(): boolean {
  return true;
}

const querySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  brandId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      start: searchParams.get("start") ?? undefined,
      end: searchParams.get("end") ?? undefined,
      brandId: searchParams.get("brandId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = parsed.data.start
      ? new Date(parsed.data.start)
      : thirtyDaysAgo;
    const endDate = parsed.data.end ? new Date(parsed.data.end) : now;

    const result = await calculateCCR({
      brandId: parsed.data.brandId,
      startDate,
      endDate,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
