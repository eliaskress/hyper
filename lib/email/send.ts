import { getResend, FROM_EMAIL } from "./resend";
import * as templates from "./templates";

async function sendEmail(to: string, template: { subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.log(`[email:skip] No RESEND_API_KEY, would send to ${to}: "${template.subject}"`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error(`[email:error] Failed to send to ${to}:`, error);
      return null;
    }

    console.log(`[email:sent] "${template.subject}" to ${to} (id: ${data?.id})`);
    return data;
  } catch (err) {
    console.error(`[email:error] Exception sending to ${to}:`, err);
    return null;
  }
}

// ── Creator Emails ──────────────────────────────────────────────────

export async function sendNewMatchEmail(
  email: string,
  data: Parameters<typeof templates.newMatchEmail>[0],
) {
  return sendEmail(email, templates.newMatchEmail(data));
}

export async function sendExpiringMatchEmail(
  email: string,
  data: Parameters<typeof templates.expiringMatchEmail>[0],
) {
  return sendEmail(email, templates.expiringMatchEmail(data));
}

export async function sendMatchAcceptedEmail(
  email: string,
  data: Parameters<typeof templates.matchAcceptedEmail>[0],
) {
  return sendEmail(email, templates.matchAcceptedEmail(data));
}

export async function sendDailyCreatorDigestEmail(
  email: string,
  data: Parameters<typeof templates.dailyCreatorDigestEmail>[0],
) {
  return sendEmail(email, templates.dailyCreatorDigestEmail(data));
}

export async function sendPaymentReceivedEmail(
  email: string,
  data: Parameters<typeof templates.paymentReceivedEmail>[0],
) {
  return sendEmail(email, templates.paymentReceivedEmail(data));
}

// ── Restaurant Emails ───────────────────────────────────────────────

export async function sendCreatorAcceptedEmail(
  email: string,
  data: Parameters<typeof templates.creatorAcceptedEmail>[0],
) {
  return sendEmail(email, templates.creatorAcceptedEmail(data));
}

export async function sendCreatorScheduledEmail(
  email: string,
  data: Parameters<typeof templates.creatorScheduledEmail>[0],
) {
  return sendEmail(email, templates.creatorScheduledEmail(data));
}

export async function sendCreatorPostedEmail(
  email: string,
  data: Parameters<typeof templates.creatorPostedEmail>[0],
) {
  return sendEmail(email, templates.creatorPostedEmail(data));
}

export async function sendHiMeasuredEmail(
  email: string,
  data: Parameters<typeof templates.hiMeasuredEmail>[0],
) {
  return sendEmail(email, templates.hiMeasuredEmail(data));
}

export async function sendWeeklyCampaignSummaryEmail(
  email: string,
  data: Parameters<typeof templates.weeklyCampaignSummaryEmail>[0],
) {
  return sendEmail(email, templates.weeklyCampaignSummaryEmail(data));
}
