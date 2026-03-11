import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const masked = dbUrl
    ? `${dbUrl.slice(0, 15)}...${dbUrl.slice(-15)} (len:${dbUrl.length})`
    : "UNDEFINED";

  let dbTest = "not tested";
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl!);
    const result = await sql`SELECT 1 as ok`;
    dbTest = `OK: ${JSON.stringify(result)}`;
  } catch (e: unknown) {
    dbTest = `FAIL: ${e instanceof Error ? e.message.slice(0, 200) : String(e)}`;
  }

  return NextResponse.json({
    db: masked,
    dbTest,
    env: process.env.VERCEL_ENV,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  });
}
