/**
 * Hyper Impact (HI)  - Core metric for measuring influence.
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

/**
 * Calculate amplification HI reward (30% of original post HI).
 */
export function calculateAmplificationHI(originalHI: number): number {
  return originalHI * (AMPLIFICATION.rewardPercent / 100);
}

/**
 * Calculate network payout from HI (network split = 20% of gross).
 */
export function calculateNetworkPayout(hi: number) {
  const grossUsd = hi * PRICE_PER_HI;
  return {
    networkUsd: grossUsd * (REVENUE_SPLIT.network / 100),
    recruiterUsd: grossUsd * (NETWORK_SPLIT.creatorRecruiter / 100),
    introducerUsd: grossUsd * (NETWORK_SPLIT.restaurantIntroducer / 100),
  };
}

export interface HIGData {
  avgHi: number;
  paidAssignments: number;
  totalNonDeclinedAssignments: number;
  amplificationEffectiveness?: number;
  networkContribution?: number;
}

export function calculateHIG(data: HIGData): number {
  // HI performance (50%): avg HI normalized to 0-100 (cap at 20 HI = 100)
  const hiScore = Math.min(100, (data.avgHi / 20) * 100);

  // Reliability (20%): paid / total non-declined assignments
  const reliability =
    data.totalNonDeclinedAssignments > 0
      ? (data.paidAssignments / data.totalNonDeclinedAssignments) * 100
      : 0;

  // Amplification effectiveness (20%): 0-100, defaults to 50 if no data
  const amplification = data.amplificationEffectiveness ?? 50;

  // Network contribution (10%): 0-100, defaults to 50 if no data
  const network = data.networkContribution ?? 50;

  const score =
    (hiScore * HIG_WEIGHTS.hiPerformance +
      amplification * HIG_WEIGHTS.amplificationEffectiveness +
      reliability * HIG_WEIGHTS.reliability +
      network * HIG_WEIGHTS.networkContribution) /
    100;

  return Math.round(Math.min(100, Math.max(0, score)));
}
