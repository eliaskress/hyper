// Cascade Contagion Rate (CCR)
// Measures how often a brand's campaign posts trigger additional creator posts
// within a 72-hour window - a signal of organic influence propagation.

import { db } from '@/lib/db';
import {
  posts,
  assignments,
  briefings,
  cascadeEvents,
} from '@/lib/db/schema';
import { eq, and, sql, isNotNull, lte, gte } from 'drizzle-orm';

export type CascadeEvent = {
  id: string;
  sourcePostId: string;
  triggeredPostId: string;
  brandId: string;
  hoursElapsed: number;
  detectionMethod: 'auto' | 'manual';
  detectedAt: Date;
};

export type CCRResult = {
  rate: number;
  numerator: number;
  denominator: number;
  label: 'early' | 'promising' | 'breakout';
};

/**
 * Detect whether a post was triggered by a prior post for the same brand.
 * Looks for measured posts by different creators within 72 hours before this post.
 * If found, records the cascade event and updates both posts.
 */
export async function detectCascade(
  postId: string
): Promise<CascadeEvent | null> {
  // Fetch the post with its assignment and briefing to get brandId and postedAt
  const [postRow] = await db
    .select({
      postId: posts.id,
      postedAt: posts.postedAt,
      assignmentId: posts.assignmentId,
      creatorId: assignments.creatorId,
      briefingId: assignments.briefingId,
      brandId: briefings.brandId,
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .where(eq(posts.id, postId));

  if (!postRow || !postRow.postedAt) {
    return null;
  }

  const postedAt = postRow.postedAt;
  const windowStart = new Date(postedAt.getTime() - 72 * 60 * 60 * 1000);

  // Find other measured posts for the same brand within 72h before this post,
  // by a different creator, ordered by postedAt ascending (earliest first)
  const candidates = await db
    .select({
      sourcePostId: posts.id,
      sourcePostedAt: posts.postedAt,
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .where(
      and(
        eq(briefings.brandId, postRow.brandId),
        isNotNull(posts.hiCalculated),
        isNotNull(posts.postedAt),
        gte(posts.postedAt, windowStart),
        lte(posts.postedAt, postedAt),
        sql`${assignments.creatorId} != ${postRow.creatorId}`,
        sql`${posts.id} != ${postId}`
      )
    )
    .orderBy(posts.postedAt)
    .limit(1);

  if (candidates.length === 0) {
    return null;
  }

  const source = candidates[0];
  const hoursElapsed =
    (postedAt.getTime() - source.sourcePostedAt!.getTime()) / (1000 * 60 * 60);

  // Insert cascade event
  const [inserted] = await db
    .insert(cascadeEvents)
    .values({
      sourcePostId: source.sourcePostId,
      triggeredPostId: postId,
      brandId: postRow.brandId,
      hoursElapsed,
      detectionMethod: 'auto',
    })
    .returning();

  // Update source post: mark as cascade trigger
  await db
    .update(posts)
    .set({ cascadeTriggered: true })
    .where(eq(posts.id, source.sourcePostId));

  // Update new post: link to cascade source
  await db
    .update(posts)
    .set({ cascadeSourceId: source.sourcePostId })
    .where(eq(posts.id, postId));

  return {
    id: inserted.id,
    sourcePostId: inserted.sourcePostId,
    triggeredPostId: inserted.triggeredPostId,
    brandId: inserted.brandId,
    hoursElapsed: inserted.hoursElapsed,
    detectionMethod: inserted.detectionMethod,
    detectedAt: inserted.detectedAt,
  };
}

/**
 * Calculate the Cascade Contagion Rate for a time window.
 * CCR = posts that triggered cascades / all measured posts.
 * Optionally filtered by brand.
 */
export async function calculateCCR(options: {
  brandId?: string;
  startDate: Date;
  endDate: Date;
}): Promise<CCRResult> {
  const { brandId, startDate, endDate } = options;

  const baseConditions = [
    isNotNull(posts.hiCalculated),
    isNotNull(posts.measuredAt),
    gte(posts.measuredAt, startDate),
    lte(posts.measuredAt, endDate),
  ];

  if (brandId) {
    baseConditions.push(eq(briefings.brandId, brandId));
  }

  // Count posts that triggered cascades
  const [triggered] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .where(and(...baseConditions, eq(posts.cascadeTriggered, true)));

  // Count all measured posts
  const [total] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .where(and(...baseConditions));

  const numerator = triggered.count;
  const denominator = total.count;
  const rate = denominator > 0 ? numerator / denominator : 0;

  let label: CCRResult['label'];
  if (rate >= 0.3) {
    label = 'breakout';
  } else if (rate >= 0.15) {
    label = 'promising';
  } else {
    label = 'early';
  }

  return { rate, numerator, denominator, label };
}
