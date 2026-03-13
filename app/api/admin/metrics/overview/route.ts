import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, brands, posts, briefings } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { calculateCCR, calculateBudgetReinvestmentRate, calculateCreatorReturnRate } from "@/lib/metrics";

// TODO: Replace with real admin auth check (session, JWT, or role-based)
function isAdmin(): boolean {
  return true;
}

export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [ccr, reinvestment, creatorRetention, brandCount, creatorCount, postCount, briefingCount] =
      await Promise.all([
        calculateCCR({ startDate: thirtyDaysAgo, endDate: now }),
        calculateBudgetReinvestmentRate(),
        calculateCreatorReturnRate(),
        db.select({ value: count() }).from(brands),
        db
          .select({ value: count() })
          .from(users)
          .where(eq(users.role, "influencer")),
        db.select({ value: count() }).from(posts),
        db.select({ value: count() }).from(briefings),
      ]);

    return NextResponse.json({
      metrics: {
        ccr,
        reinvestment,
        creatorRetention,
      },
      pilot: {
        totalBrands: brandCount[0]?.value ?? 0,
        totalCreators: creatorCount[0]?.value ?? 0,
        totalPosts: postCount[0]?.value ?? 0,
        totalBriefings: briefingCount[0]?.value ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
