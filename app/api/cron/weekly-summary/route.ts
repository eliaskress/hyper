import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { sendWeeklyCampaignSummaryEmail } from "@/lib/email";

// Vercel Cron - runs every Monday at 9am PT (17:00 UTC)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  let sentCount = 0;

  // Get all brands with email
  const brandUsers = await sql`
    SELECT
      b.id as brand_id,
      b.business_name,
      u.email,
      u.email_preferences
    FROM brands b
    JOIN users u ON b.user_id = u.id
    WHERE u.email IS NOT NULL
  `;

  for (const brand of brandUsers) {
    const prefs = brand.email_preferences as Record<string, boolean> | null;
    if (prefs?.weeklySummary === false) continue;

    // Get this week's stats
    const [stats] = await sql`
      SELECT
        COALESCE(SUM(CAST(p.hi_calculated AS numeric)), 0) as total_hi,
        COALESCE(SUM(p.reach), 0) as total_reach,
        COUNT(DISTINCT a.creator_id) as creators_posted,
        COALESCE(SUM(CAST(pay.amount AS numeric)), 0) as total_spend
      FROM briefings bf
      JOIN assignments a ON a.briefing_id = bf.id
      LEFT JOIN posts p ON p.assignment_id = a.id AND p.posted_at >= NOW() - INTERVAL '7 days'
      LEFT JOIN payouts pay ON pay.assignment_id = a.id AND pay.paid_at >= NOW() - INTERVAL '7 days'
      WHERE bf.brand_id = ${brand.brand_id}
    `;

    const totalHi = parseFloat(stats.total_hi) || 0;
    const totalReach = parseInt(stats.total_reach) || 0;
    const creatorsPosted = parseInt(stats.creators_posted) || 0;
    const totalSpend = parseFloat(stats.total_spend) || 0;

    // Skip if no activity this week
    if (totalHi === 0 && creatorsPosted === 0) continue;

    // Get top creator
    const [topCreator] = await sql`
      SELECT u.handle, CAST(p.hi_calculated AS numeric) as hi
      FROM posts p
      JOIN assignments a ON p.assignment_id = a.id
      JOIN users u ON a.creator_id = u.id
      JOIN briefings bf ON a.briefing_id = bf.id
      WHERE bf.brand_id = ${brand.brand_id}
        AND p.posted_at >= NOW() - INTERVAL '7 days'
        AND p.hi_calculated IS NOT NULL
      ORDER BY CAST(p.hi_calculated AS numeric) DESC
      LIMIT 1
    `;

    await sendWeeklyCampaignSummaryEmail(brand.email, {
      brandName: brand.business_name,
      totalHi,
      totalReach,
      creatorsPosted,
      totalSpend,
      topCreator: topCreator ? { handle: topCreator.handle, hi: parseFloat(topCreator.hi) } : null,
    });
    sentCount++;
  }

  return NextResponse.json({
    ok: true,
    weeklySummaries: sentCount,
    timestamp: new Date().toISOString(),
  });
}
