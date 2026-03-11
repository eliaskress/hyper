/**
 * Stripe & pricing configuration.
 * PRD pricing: $10/HI, 40% Hyper / 40% Creator / 20% Network
 * See lib/hi/index.ts for the full HI formula and revenue split constants.
 */

export const PLATFORM_FEE_PERCENT = 40; // Hyper's share per PRD
export const CREATOR_SHARE_PERCENT = 40;
export const NETWORK_SHARE_PERCENT = 20;
export const CURRENCY = "usd";
export const MIN_PAYOUT_AMOUNT = 10_00; // in cents
export const PRICE_PER_HI_USD = 10;
