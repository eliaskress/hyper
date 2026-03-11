/**
 * Hyper Impact (HI) — Core metric for measuring influence.
 *
 * Formula: HI = 100 * (L + 2C + 6S + 8SH) / R
 *
 * Where:
 *   L  = Likes
 *   C  = Comments
 *   S  = Saves
 *   SH = Shares
 *   R  = Reach (unique users who saw the post)
 *
 * Reach is measured 7 days after posting.
 * If reach is missing, HI cannot be calculated.
 */

export interface PostMetrics {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
}

export function calculateHI(metrics: PostMetrics): number {
  if (metrics.reach <= 0) {
    throw new Error("Reach is required and must be positive to calculate HI");
  }

  const { likes, comments, saves, shares, reach } = metrics;
  return 100 * (likes + 2 * comments + 6 * saves + 8 * shares) / reach;
}

/** Price per HI unit in USD */
export const PRICE_PER_HI = 10;

/** Revenue split percentages */
export const REVENUE_SPLIT = {
  hyper: 40,
  creator: 40,
  network: 20,
} as const;

/** Network reward split */
export const NETWORK_SPLIT = {
  creatorRecruiter: 10,
  restaurantIntroducer: 10,
} as const;

/** Network referral cap in months */
export const NETWORK_CAP_MONTHS = 24;

/** Amplification constants */
export const AMPLIFICATION = {
  rewardPercent: 30,
  maxAmplifiersPerPost: 5,
  maxAmplificationPercent: 50, // of creator's own HI in campaign
} as const;

/**
 * HIG (Hyper Influence Graph) score components.
 * Range: 0-100. Determines campaign allocation priority.
 */
export const HIG_WEIGHTS = {
  hiPerformance: 50,
  amplificationEffectiveness: 20,
  reliability: 20,
  networkContribution: 10,
} as const;

export function calculatePayout(hi: number) {
  const grossUsd = hi * PRICE_PER_HI;
  return {
    grossUsd,
    hyperUsd: grossUsd * (REVENUE_SPLIT.hyper / 100),
    creatorUsd: grossUsd * (REVENUE_SPLIT.creator / 100),
    networkUsd: grossUsd * (REVENUE_SPLIT.network / 100),
  };
}

export async function calculateHIG(_creatorId: string): Promise<number> {
  throw new Error("Not implemented: calculateHIG");
}
