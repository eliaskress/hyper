import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, brands, briefings, assignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const [user] = await db.select().from(users).where(eq(users.id, "00000000-0000-0000-0000-000000000001")).limit(1);
    results.user = user ? `OK: ${user.handle}` : "NOT FOUND";
  } catch (e: unknown) {
    results.user = `FAIL: ${e instanceof Error ? e.message.slice(0, 300) : String(e)}`;
  }

  try {
    const [brand] = await db.select().from(brands).where(eq(brands.userId, "00000000-0000-0000-0000-000000000010")).limit(1);
    results.brand = brand ? `OK: ${brand.businessName}` : "NOT FOUND";
  } catch (e: unknown) {
    results.brand = `FAIL: ${e instanceof Error ? e.message.slice(0, 300) : String(e)}`;
  }

  try {
    const { getCreatorAssignments } = await import("@/lib/db/queries");
    const a = await getCreatorAssignments("00000000-0000-0000-0000-000000000001");
    results.assignments = `OK: ${a.length} assignments`;
  } catch (e: unknown) {
    results.assignments = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  try {
    const { getCreatorStats } = await import("@/lib/db/queries");
    const s = await getCreatorStats("00000000-0000-0000-0000-000000000001");
    results.stats = `OK: ${JSON.stringify(s).slice(0, 200)}`;
  } catch (e: unknown) {
    results.stats = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  try {
    const { getBrandStats } = await import("@/lib/db/queries");
    const s = await getBrandStats("00000000-0000-0000-0000-000000000100");
    results.brandStats = `OK: ${JSON.stringify(s).slice(0, 200)}`;
  } catch (e: unknown) {
    results.brandStats = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  return NextResponse.json(results);
}
