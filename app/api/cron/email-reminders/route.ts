import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { sendExpiringMatchEmail, sendDailyCreatorDigestEmail } from "@/lib/email";

// Vercel Cron or manual trigger - runs daily at 8am PT
// vercel.json: { "crons": [{ "path": "/api/cron/email-reminders", "schedule": "0 16 * * *" }] }

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const now = new Date();
  let expiringCount = 0;
  let digestCount = 0;

  // ── 1. Expiring match reminders (12h or less remaining) ─────────
  const expiringMatches = await sql`
    SELECT
      a.id,
      a.response_due_at,
      u.handle,
      u.email,
      u.email_preferences,
      b.business_name
    FROM assignments a
    JOIN users u ON a.creator_id = u.id
    JOIN briefings bf ON a.briefing_id = bf.id
    JOIN brands b ON bf.brand_id = b.id
    WHERE a.status = 'invited'
      AND a.response_due_at IS NOT NULL
      AND a.response_due_at > NOW()
      AND a.response_due_at <= NOW() + INTERVAL '12 hours'
      AND u.email IS NOT NULL
  `;

  for (const match of expiringMatches) {
    const prefs = match.email_preferences as Record<string, boolean> | null;
    if (prefs?.expiringMatches === false) continue;
    const hoursLeft = (new Date(match.response_due_at).getTime() - now.getTime()) / (1000 * 60 * 60);
    await sendExpiringMatchEmail(match.email, {
      creatorName: match.handle,
      restaurantName: match.business_name,
      hoursLeft,
    });
    expiringCount++;
  }

  // ── 2. Daily creator digests ────────────────────────────────────
  // Get all creators with email
  const creators = await sql`
    SELECT DISTINCT u.id, u.handle, u.email, u.email_preferences
    FROM users u
    WHERE u.role = 'influencer'
      AND u.email IS NOT NULL
  `;

  for (const creator of creators) {
    const creatorPrefs = creator.email_preferences as Record<string, boolean> | null;
    if (creatorPrefs?.dailyDigest === false) continue;
    // Today's scheduled visits
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayVisits = await sql`
      SELECT
        b.business_name,
        b.address,
        a.schedule_time_start,
        a.schedule_time_end,
        a.schedule_type
      FROM assignments a
      JOIN briefings bf ON a.briefing_id = bf.id
      JOIN brands b ON bf.brand_id = b.id
      WHERE a.creator_id = ${creator.id}
        AND a.status IN ('accepted', 'scheduled')
        AND a.scheduled_date >= ${todayStart.toISOString()}
        AND a.scheduled_date < ${todayEnd.toISOString()}
    `;

    // Pending matches
    const [pendingResult] = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (
          WHERE a.response_due_at IS NOT NULL
          AND a.response_due_at <= NOW() + INTERVAL '24 hours'
          AND a.response_due_at > NOW()
        ) as expiring_today
      FROM assignments a
      WHERE a.creator_id = ${creator.id}
        AND a.status = 'invited'
    `;

    const pendingMatches = parseInt(pendingResult.total);
    const expiringToday = parseInt(pendingResult.expiring_today);

    // Skip if nothing to report
    if (todayVisits.length === 0 && pendingMatches === 0) continue;

    await sendDailyCreatorDigestEmail(creator.email, {
      creatorName: creator.handle,
      todayVisits: todayVisits.map((v: Record<string, string>) => ({
        restaurantName: v.business_name,
        address: v.address ?? "",
        time: v.schedule_time_start
          ? `${v.schedule_time_start}${v.schedule_type === "flexible" && v.schedule_time_end ? `-${v.schedule_time_end}` : ""}`
          : "Flexible",
      })),
      pendingMatches,
      expiringToday,
    });
    digestCount++;
  }

  return NextResponse.json({
    ok: true,
    expiringReminders: expiringCount,
    dailyDigests: digestCount,
    timestamp: now.toISOString(),
  });
}
