// Budget Reinvestment Rate
// Tracks how many brands increase their HI budget across successive briefings.
// A high reinvestment rate signals that brands see ROI and are doubling down.

import { db } from '@/lib/db';
import { campaignSequences } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export type ReinvestmentResult = {
  rate: number;
  brandsWithIncrease: number;
  brandsWith2PlusBriefings: number;
  avgSequenceBeforeIncrease: number;
  label: 'healthy' | 'building';
};

/**
 * Calculate the budget reinvestment rate across all brands.
 * Numerator: brands where any campaign sequence row has budgetIncreased = true.
 * Denominator: brands with 2+ briefings (sequenceNumber >= 2).
 */
export async function calculateBudgetReinvestmentRate(): Promise<ReinvestmentResult> {
  // Brands with at least one budget increase
  const [withIncrease] = await db
    .select({
      count: sql<number>`count(distinct ${campaignSequences.brandId})::int`,
    })
    .from(campaignSequences)
    .where(eq(campaignSequences.budgetIncreased, true));

  // Brands with 2+ briefings (any row with sequenceNumber >= 2)
  const [with2Plus] = await db
    .select({
      count: sql<number>`count(distinct ${campaignSequences.brandId})::int`,
    })
    .from(campaignSequences)
    .where(sql`${campaignSequences.sequenceNumber} >= 2`);

  // Average sequence number at which the first increase happened per brand
  const avgResult = await db
    .select({
      avgSeq: sql<number>`coalesce(avg(min_seq), 0)::float`,
    })
    .from(
      sql`(
        select ${campaignSequences.brandId}, min(${campaignSequences.sequenceNumber}) as min_seq
        from ${campaignSequences}
        where ${campaignSequences.budgetIncreased} = true
        group by ${campaignSequences.brandId}
      ) as first_increases`
    );

  const brandsWithIncrease = withIncrease.count;
  const brandsWith2PlusBriefings = with2Plus.count;
  const rate =
    brandsWith2PlusBriefings > 0
      ? brandsWithIncrease / brandsWith2PlusBriefings
      : 0;
  const avgSequenceBeforeIncrease = avgResult[0]?.avgSeq ?? 0;

  const label: ReinvestmentResult['label'] = rate > 0.4 ? 'healthy' : 'building';

  return {
    rate,
    brandsWithIncrease,
    brandsWith2PlusBriefings,
    avgSequenceBeforeIncrease,
    label,
  };
}

/**
 * Record a new briefing launch for a brand.
 * Determines the sequence number and whether the budget increased
 * compared to the previous briefing.
 */
export async function onBriefingLaunched(
  brandId: string,
  briefingId: string,
  budgetHi: string
): Promise<void> {
  // Get the last campaign sequence for this brand
  const [lastSequence] = await db
    .select({
      sequenceNumber: campaignSequences.sequenceNumber,
      budgetHiUnits: campaignSequences.budgetHiUnits,
    })
    .from(campaignSequences)
    .where(eq(campaignSequences.brandId, brandId))
    .orderBy(desc(campaignSequences.sequenceNumber))
    .limit(1);

  const nextSequence = lastSequence ? lastSequence.sequenceNumber + 1 : 1;
  const budgetIncreased = lastSequence
    ? parseFloat(budgetHi) > parseFloat(lastSequence.budgetHiUnits)
    : false;

  await db.insert(campaignSequences).values({
    brandId,
    briefingId,
    sequenceNumber: nextSequence,
    budgetHiUnits: budgetHi,
    budgetIncreased,
  });
}
