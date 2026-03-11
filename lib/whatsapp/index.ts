/**
 * WhatsApp Business API — Message templates for Hyper agent flows.
 *
 * STUB: These templates define the message formats for all 8 agent flows.
 * Actual WhatsApp Business API integration is not yet implemented.
 */

export const MESSAGE_TEMPLATES = {
  // Creator Onboarding Agent
  creatorWelcome: (handle: string) =>
    `Hey ${handle}! 👋 Welcome to Hyper. You've been matched with local restaurants that want your influence. Let's get you set up.`,

  creatorVerified: (handle: string) =>
    `✅ Your profile is verified, ${handle}. We'll send you restaurant assignments based on your HIG score and location. Stay tuned!`,

  // Campaign Allocation Agent
  creatorInvitation: (handle: string, restaurantName: string, brief: string) =>
    `Hi ${handle}! 🍽️ You've been matched with ${restaurantName}.\n\nBrief: ${brief}\n\nReply YES to accept or NO to decline.`,

  creatorScheduled: (handle: string, restaurantName: string, date: string, time: string) =>
    `Confirmed! You're visiting ${restaurantName} on ${date} at ${time}. We'll remind you the day before. 📸`,

  // Creator Operations Agent
  creatorPostReminder: (handle: string, restaurantName: string) =>
    `Hey ${handle}! How was your visit to ${restaurantName}? Send us your post link when you're ready.`,

  creatorAnalyticsRequest: (handle: string) =>
    `Thanks for posting, ${handle}! 📊 In 7 days, send us a screenshot of your post analytics so we can calculate your HI.`,

  // Metrics Extraction Agent
  creatorHiResult: (handle: string, hi: number, earnings: number) =>
    `Your post generated ${hi.toFixed(1)} HI! 🎉\nThat's $${earnings.toFixed(2)} in your pocket (40% creator share).\nPayout processing shortly.`,

  // Reporting Agent
  restaurantReport: (businessName: string, creatorsCount: number, totalHi: number, totalSpend: number) =>
    `📊 ${businessName} — Weekly Report\n\n` +
    `Creators active: ${creatorsCount}\n` +
    `HI delivered: ${totalHi.toFixed(1)}\n` +
    `Total investment: $${totalSpend.toFixed(2)}\n\n` +
    `Your influence engine is running. We'll keep matching and measuring.`,

  restaurantCreatorUpdate: (businessName: string, handle: string, hi: number) =>
    `Update for ${businessName}: @${handle} just delivered ${hi.toFixed(1)} HI from their latest post. 🔥`,

  // Restaurant Onboarding Agent
  restaurantWelcome: (businessName: string) =>
    `Welcome to Hyper, ${businessName}! 🎯 We'll handle everything — matching creators, scheduling visits, and measuring results. You just focus on the food.`,

  // Payout & Ledger Agent
  creatorPayoutSent: (handle: string, amount: number) =>
    `💰 ${handle}, $${amount.toFixed(2)} has been sent to your Stripe account. Thanks for creating great content!`,
} as const;

/** Stub function — will send WhatsApp message via Business API */
export async function sendWhatsAppMessage(
  _phoneNumber: string,
  _message: string,
): Promise<{ success: boolean; messageId?: string }> {
  console.log("[WhatsApp STUB] Would send message to", _phoneNumber);
  return { success: true, messageId: "stub_" + Date.now() };
}
