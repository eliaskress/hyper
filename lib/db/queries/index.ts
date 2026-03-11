import { db } from "@/lib/db";
import { users, brands, campaigns, applications, payouts, badges } from "@/lib/db/schema";
import { eq, desc, count, sum, sql } from "drizzle-orm";

// ── Creator Queries ─────────────────────────────────────────────────

export async function getActiveCampaigns() {
  return db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      description: campaigns.description,
      payout: campaigns.payout,
      status: campaigns.status,
      deadline: campaigns.deadline,
      createdAt: campaigns.createdAt,
      brandId: campaigns.brandId,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
    })
    .from(campaigns)
    .innerJoin(brands, eq(campaigns.brandId, brands.id))
    .where(eq(campaigns.status, "active"))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCreatorStats(userId: string) {
  const [appStats] = await db
    .select({
      total: count(),
      accepted: count(sql`CASE WHEN ${applications.status} = 'accepted' THEN 1 END`),
      paid: count(sql`CASE WHEN ${applications.status} = 'paid' THEN 1 END`),
    })
    .from(applications)
    .where(eq(applications.influencerId, userId));

  const [earnings] = await db
    .select({
      totalEarned: sum(payouts.amount),
    })
    .from(payouts)
    .innerJoin(applications, eq(payouts.applicationId, applications.id))
    .where(eq(applications.influencerId, userId));

  const userBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.userId, userId));

  return {
    totalApplications: appStats?.total ?? 0,
    acceptedCampaigns: appStats?.accepted ?? 0,
    completedCampaigns: appStats?.paid ?? 0,
    totalEarned: earnings?.totalEarned ?? "0",
    badges: userBadges,
  };
}

export async function getCreatorApplications(userId: string) {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      postUrl: applications.postUrl,
      submittedAt: applications.submittedAt,
      campaignTitle: campaigns.title,
      campaignPayout: campaigns.payout,
      businessName: brands.businessName,
      address: brands.address,
    })
    .from(applications)
    .innerJoin(campaigns, eq(applications.campaignId, campaigns.id))
    .innerJoin(brands, eq(campaigns.brandId, brands.id))
    .where(eq(applications.influencerId, userId))
    .orderBy(desc(applications.submittedAt));
}

export async function getCreatorEarnings(userId: string) {
  return db
    .select({
      payoutId: payouts.id,
      amount: payouts.amount,
      status: payouts.status,
      paidAt: payouts.paidAt,
      campaignTitle: campaigns.title,
      businessName: brands.businessName,
      address: brands.address,
    })
    .from(payouts)
    .innerJoin(applications, eq(payouts.applicationId, applications.id))
    .innerJoin(campaigns, eq(applications.campaignId, campaigns.id))
    .innerJoin(brands, eq(campaigns.brandId, brands.id))
    .where(eq(applications.influencerId, userId))
    .orderBy(desc(payouts.paidAt));
}

export async function getCreatorProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      handle: users.handle,
      instagramId: users.instagramId,
      avatar: users.avatar,
      followersCount: users.followersCount,
      location: users.location,
      stripeAccountId: users.stripeAccountId,
      xp: users.xp,
      tier: users.tier,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
}

// ── Brand/Restaurant Queries ────────────────────────────────────────

export async function getBrandByUserId(userId: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.userId, userId));
  return brand ?? null;
}

export async function getBrandCampaigns(brandId: string) {
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.brandId, brandId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getBrandStats(brandId: string) {
  const brandCampaigns = await db
    .select({
      id: campaigns.id,
      status: campaigns.status,
      payout: campaigns.payout,
    })
    .from(campaigns)
    .where(eq(campaigns.brandId, brandId));

  const campaignIds = brandCampaigns.map((c) => c.id);

  let totalApplications = 0;
  let totalPaid = 0;

  if (campaignIds.length > 0) {
    const [appStats] = await db
      .select({
        total: count(),
      })
      .from(applications)
      .where(sql`${applications.campaignId} IN ${campaignIds}`);
    totalApplications = appStats?.total ?? 0;

    const [paidStats] = await db
      .select({
        total: sum(payouts.amount),
      })
      .from(payouts)
      .innerJoin(applications, eq(payouts.applicationId, applications.id))
      .where(sql`${applications.campaignId} IN ${campaignIds}`);
    totalPaid = parseFloat(paidStats?.total ?? "0");
  }

  return {
    totalCampaigns: brandCampaigns.length,
    activeCampaigns: brandCampaigns.filter((c) => c.status === "active").length,
    completedCampaigns: brandCampaigns.filter((c) => c.status === "completed").length,
    totalApplications,
    totalPaidOut: totalPaid,
  };
}

export async function getCampaignWithApplications(campaignId: string) {
  const [campaign] = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      description: campaigns.description,
      payout: campaigns.payout,
      status: campaigns.status,
      deadline: campaigns.deadline,
      createdAt: campaigns.createdAt,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
    })
    .from(campaigns)
    .innerJoin(brands, eq(campaigns.brandId, brands.id))
    .where(eq(campaigns.id, campaignId));

  if (!campaign) return null;

  const apps = await db
    .select({
      id: applications.id,
      influencerId: applications.influencerId,
      status: applications.status,
      postUrl: applications.postUrl,
      submittedAt: applications.submittedAt,
      creatorHandle: users.handle,
      creatorTier: users.tier,
      creatorFollowers: users.followersCount,
      creatorLocation: users.location,
      creatorInstagramId: users.instagramId,
    })
    .from(applications)
    .innerJoin(users, eq(applications.influencerId, users.id))
    .where(eq(applications.campaignId, campaignId))
    .orderBy(desc(applications.submittedAt));

  return { ...campaign, applications: apps };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected",
) {
  const [updated] = await db
    .update(applications)
    .set({ status })
    .where(eq(applications.id, applicationId))
    .returning();
  return updated ?? null;
}

export async function getApplicationById(applicationId: string) {
  const [app] = await db
    .select({
      id: applications.id,
      campaignId: applications.campaignId,
      influencerId: applications.influencerId,
      status: applications.status,
      postUrl: applications.postUrl,
      submittedAt: applications.submittedAt,
    })
    .from(applications)
    .where(eq(applications.id, applicationId));
  return app ?? null;
}

export async function getCampaignById(campaignId: string) {
  const [campaign] = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      description: campaigns.description,
      payout: campaigns.payout,
      status: campaigns.status,
      deadline: campaigns.deadline,
      createdAt: campaigns.createdAt,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
      brandId: campaigns.brandId,
    })
    .from(campaigns)
    .innerJoin(brands, eq(campaigns.brandId, brands.id))
    .where(eq(campaigns.id, campaignId));

  return campaign ?? null;
}
