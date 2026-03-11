import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  // Show first 30 chars + last 20 chars (mask the middle for security)
  const masked = dbUrl
    ? `${dbUrl.slice(0, 30)}...${dbUrl.slice(-20)} (length: ${dbUrl.length})`
    : "UNDEFINED";

  let dbTest = "not tested";
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl!);
    const result = await sql`SELECT 1 as ok`;
    dbTest = `connected OK: ${JSON.stringify(result)}`;
  } catch (e: unknown) {
    dbTest = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    DATABASE_URL: masked,
    dbTest,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
