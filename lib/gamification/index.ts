export const TIER_THRESHOLDS = {
  starter: 0,
  rising: 100,
  established: 500,
  pro: 2000,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

export function getTierForXp(xp: number): Tier {
  if (xp >= TIER_THRESHOLDS.pro) return "pro";
  if (xp >= TIER_THRESHOLDS.established) return "established";
  if (xp >= TIER_THRESHOLDS.rising) return "rising";
  return "starter";
}

export async function grantXp(_userId: string, _amount: number): Promise<void> {
  throw new Error("Not implemented: grantXp");
}

export async function checkBadges(_userId: string): Promise<void> {
  throw new Error("Not implemented: checkBadges");
}
