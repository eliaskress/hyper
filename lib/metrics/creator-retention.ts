// Creator Retention (Return Rate)
// Measures how many creators come back for a second engagement.
// High return rate means the creator experience is working.

import { db } from '@/lib/db';
import { creatorEngagements } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export type RetentionResult = {
  returnRate: number;
  creatorsWithReturn: number;
  totalActiveCreators: number;
  avgCollabsPerCreator: number;
};

/**
 * Calculate the creator return rate.
 * Numerator: creators with engagementNumber >= 2 (they came back).
 * Denominator: all creators with at least 1 completed engagement.
 */
export async function calculateCreatorReturnRate(): Promise<RetentionResult> {
  // Creators who returned (have at least one row with engagementNumber >= 2)
  const [returning] = await db
    .select({
      count: sql<number>`count(distinct ${creatorEngagements.creatorId})::int`,
    })
    .from(creatorEngagements)
    .where(sql`${creatorEngagements.engagementNumber} >= 2`);

  // All creators with at least 1 engagement
  const [total] = await db
    .select({
      count: sql<number>`count(distinct ${creatorEngagements.creatorId})::int`,
    })
    .from(creatorEngagements);

  // Average collaborations per creator
  const [avgResult] = await db
    .select({
      avg: sql<number>`coalesce(avg(max_eng), 0)::float`,
    })
    .from(
      sql`(
        select max(${creatorEngagements.engagementNumber}) as max_eng
        from ${creatorEngagements}
        group by ${creatorEngagements.creatorId}
      ) as creator_maxes`
    );

  const creatorsWithReturn = returning.count;
  const totalActiveCreators = total.count;
  const returnRate =
    totalActiveCreators > 0 ? creatorsWithReturn / totalActiveCreators : 0;
  const avgCollabsPerCreator = avgResult.avg;

  return {
    returnRate,
    creatorsWithReturn,
    totalActiveCreators,
    avgCollabsPerCreator,
  };
}

/**
 * Record a completed collaboration for a creator.
 * Counts existing engagements and inserts with the next engagement number.
 */
export async function onCollabCompleted(
  creatorId: string,
  briefingId: string,
  brandId: string
): Promise<void> {
  // Count existing engagements for this creator
  const [existing] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(creatorEngagements)
    .where(eq(creatorEngagements.creatorId, creatorId));

  const engagementNumber = existing.count + 1;

  await db.insert(creatorEngagements).values({
    creatorId,
    briefingId,
    brandId,
    engagementNumber,
  });
}
