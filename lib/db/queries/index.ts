import { db } from "@/lib/db";
import { users, brands, briefings, assignments, posts, payouts, badges, propagationEvents, referrals, notifications } from "@/lib/db/schema";
import { eq, desc, count, sum, avg, sql, and, ne } from "drizzle-orm";
import { PRICE_PER_HI, NETWORK_SPLIT } from "@/lib/hi";

// ── Creator Queries ─────────────────────────────────────────────────

export async function getCreatorAssignments(userId: string) {
  const rows = await db
    .select({
      id: assignments.id,
      status: assignments.status,
      allocatedHi: assignments.allocatedHi,
      scheduledDate: assignments.scheduledDate,
      scheduleType: assignments.scheduleTypeField,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
      role: assignments.role,
      responseDueAt: assignments.responseDueAt,
      createdAt: assignments.createdAt,
      contentBrief: briefings.contentBrief,
      offerDescription: briefings.offerDescription,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
      postUrl: posts.postUrl,
      hiCalculated: posts.hiCalculated,
    })
    .from(assignments)
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.creatorId, userId))
    .orderBy(desc(assignments.createdAt));

  // Deduplicate: one row per assignment, summing HI across posts
  const seen = new Map<string, typeof rows[number]>();
  for (const row of rows) {
    const existing = seen.get(row.id);
    if (!existing) {
      seen.set(row.id, row);
    } else if (row.hiCalculated) {
      const prevHi = parseFloat(existing.hiCalculated ?? "0");
      const thisHi = parseFloat(row.hiCalculated);
      seen.set(row.id, {
        ...existing,
        hiCalculated: (prevHi + thisHi).toFixed(2),
        postUrl: existing.postUrl ?? row.postUrl,
      });
    }
  }
  return Array.from(seen.values());
}

export async function getCreatorStats(userId: string) {
  const [assignmentStats] = await db
    .select({
      total: count(),
      accepted: count(sql`CASE WHEN ${assignments.status} IN ('accepted','scheduled','posted','measured','paid') THEN 1 END`),
      upcoming: count(sql`CASE WHEN ${assignments.status} IN ('invited','accepted','scheduled') THEN 1 END`),
      paid: count(sql`CASE WHEN ${assignments.status} = 'paid' THEN 1 END`),
    })
    .from(assignments)
    .where(eq(assignments.creatorId, userId));

  const [earnings] = await db
    .select({
      totalEarned: sum(payouts.amount),
      totalHi: sum(payouts.hiAmount),
    })
    .from(payouts)
    .innerJoin(assignments, eq(payouts.assignmentId, assignments.id))
    .where(eq(assignments.creatorId, userId));

  const userBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.userId, userId));

  return {
    totalAssignments: assignmentStats?.total ?? 0,
    activeAssignments: assignmentStats?.accepted ?? 0,
    upcomingAssignments: assignmentStats?.upcoming ?? 0,
    completedAssignments: assignmentStats?.paid ?? 0,
    totalEarned: earnings?.totalEarned ?? "0",
    totalHi: earnings?.totalHi ?? "0",
    badges: userBadges,
  };
}

export async function getCreatorEarnings(userId: string) {
  return db
    .select({
      payoutId: payouts.id,
      amount: payouts.amount,
      hiAmount: payouts.hiAmount,
      status: payouts.status,
      paidAt: payouts.paidAt,
      contentBrief: briefings.contentBrief,
      businessName: brands.businessName,
      address: brands.address,
    })
    .from(payouts)
    .innerJoin(assignments, eq(payouts.assignmentId, assignments.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .where(eq(assignments.creatorId, userId))
    .orderBy(desc(payouts.paidAt));
}

export async function getCreatorProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      handle: users.handle,
      instagramId: users.instagramId,
      email: users.email,
      avatar: users.avatar,
      followersCount: users.followersCount,
      location: users.location,
      stripeAccountId: users.stripeAccountId,
      xp: users.xp,
      tier: users.tier,
      higScore: users.higScore,
      primaryPlatform: users.primaryPlatform,
      platforms: users.platforms,
      neighborhood: users.neighborhood,
      referralCode: users.referralCode,
      emailPreferences: users.emailPreferences,
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
  if (!brand) return null;

  const [user] = await db
    .select({ email: users.email, emailPreferences: users.emailPreferences })
    .from(users)
    .where(eq(users.id, userId));

  return { ...brand, email: user?.email ?? null, emailPreferences: user?.emailPreferences ?? null };
}

export async function getBrandBriefing(brandId: string) {
  const [briefing] = await db
    .select()
    .from(briefings)
    .where(eq(briefings.brandId, brandId))
    .orderBy(desc(briefings.createdAt))
    .limit(1);
  return briefing ?? null;
}

export async function getBrandStats(brandId: string) {
  const briefing = await getBrandBriefing(brandId);
  if (!briefing) {
    return {
      hasBriefing: false,
      creatorsMatched: 0,
      hiAllocated: "0",
      hiDelivered: "0",
      totalPaidOut: 0,
      nextVisit: null,
      engagement: { likes: 0, comments: 0, saves: 0, shares: 0, reach: 0 },
    };
  }

  const assignmentList = await db
    .select({
      id: assignments.id,
      status: assignments.status,
      scheduledDate: assignments.scheduledDate,
      allocatedHi: assignments.allocatedHi,
    })
    .from(assignments)
    .where(eq(assignments.briefingId, briefing.id));

  const [paidStats] = await db
    .select({
      total: sum(payouts.amount),
    })
    .from(payouts)
    .innerJoin(assignments, eq(payouts.assignmentId, assignments.id))
    .where(eq(assignments.briefingId, briefing.id));

  const [engagementStats] = await db
    .select({
      totalLikes: sum(posts.likes),
      totalComments: sum(posts.comments),
      totalSaves: sum(posts.saves),
      totalShares: sum(posts.shares),
      totalReach: sum(posts.reach),
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.briefingId, briefing.id));

  const now = new Date();
  const upcomingVisits = assignmentList
    .filter((a) => a.scheduledDate && new Date(a.scheduledDate) > now)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

  const totalAllocatedHi = assignmentList.reduce(
    (sum, a) => sum + parseFloat(a.allocatedHi ?? "0"),
    0
  );

  return {
    hasBriefing: true,
    creatorsMatched: assignmentList.length,
    hiAllocated: totalAllocatedHi.toFixed(2),
    hiDelivered: briefing.hiDelivered,
    totalPaidOut: parseFloat(paidStats?.total ?? "0"),
    nextVisit: upcomingVisits[0]?.scheduledDate ?? null,
    engagement: {
      likes: parseInt(engagementStats?.totalLikes ?? "0"),
      comments: parseInt(engagementStats?.totalComments ?? "0"),
      saves: parseInt(engagementStats?.totalSaves ?? "0"),
      shares: parseInt(engagementStats?.totalShares ?? "0"),
      reach: parseInt(engagementStats?.totalReach ?? "0"),
    },
  };
}

export async function getBriefingCreators(briefingId: string) {
  return db
    .select({
      assignmentId: assignments.id,
      status: assignments.status,
      allocatedHi: assignments.allocatedHi,
      scheduledDate: assignments.scheduledDate,
      scheduleType: assignments.scheduleTypeField,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
      role: assignments.role,
      creatorId: users.id,
      handle: users.handle,
      avatar: users.avatar,
      followersCount: users.followersCount,
      location: users.location,
      instagramId: users.instagramId,
      tier: users.tier,
      higScore: users.higScore,
      postUrl: posts.postUrl,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.briefingId, briefingId))
    .orderBy(desc(assignments.createdAt));
}

export async function getBriefingReports(briefingId: string) {
  return db
    .select({
      postId: posts.id,
      postUrl: posts.postUrl,
      platform: posts.platform,
      likes: posts.likes,
      comments: posts.comments,
      saves: posts.saves,
      shares: posts.shares,
      reach: posts.reach,
      hiCalculated: posts.hiCalculated,
      postedAt: posts.postedAt,
      measuredAt: posts.measuredAt,
      creatorHandle: users.handle,
      creatorAvatar: users.avatar,
      creatorFollowers: users.followersCount,
      assignmentId: assignments.id,
      assignmentStatus: assignments.status,
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .where(eq(assignments.briefingId, briefingId))
    .orderBy(desc(posts.postedAt));
}

export async function getAssignmentById(assignmentId: string) {
  const [assignment] = await db
    .select({
      id: assignments.id,
      briefingId: assignments.briefingId,
      creatorId: assignments.creatorId,
      status: assignments.status,
      allocatedHi: assignments.allocatedHi,
      scheduledDate: assignments.scheduledDate,
      scheduleType: assignments.scheduleTypeField,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
      declineReason: assignments.declineReason,
    })
    .from(assignments)
    .where(eq(assignments.id, assignmentId));
  return assignment ?? null;
}

export async function getAssignmentEmailContext(assignmentId: string) {
  const [row] = await db
    .select({
      creatorHandle: users.handle,
      creatorEmail: users.email,
      creatorEmailPreferences: users.emailPreferences,
      creatorFollowers: users.followersCount,
      brandName: brands.businessName,
      brandAddress: brands.address,
      brandUserId: brands.userId,
      contentBrief: briefings.contentBrief,
      offerDescription: briefings.offerDescription,
      responseHours: briefings.responseHours,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .where(eq(assignments.id, assignmentId));
  if (!row) return null;

  // Get brand user email + preferences
  const [brandUser] = await db
    .select({ email: users.email, emailPreferences: users.emailPreferences })
    .from(users)
    .where(eq(users.id, row.brandUserId));

  return {
    creatorHandle: row.creatorHandle,
    creatorEmail: row.creatorEmail,
    creatorFollowers: row.creatorFollowers ?? 0,
    creatorEmailPreferences: row.creatorEmailPreferences,
    brandName: row.brandName,
    brandAddress: row.brandAddress ?? "",
    brandEmail: brandUser?.email ?? null,
    brandEmailPreferences: brandUser?.emailPreferences ?? null,
    contentBrief: row.contentBrief,
    offerDescription: row.offerDescription,
    responseHours: row.responseHours,
  };
}

export async function getAssignmentDetail(assignmentId: string) {
  const rows = await db
    .select({
      id: assignments.id,
      status: assignments.status,
      allocatedHi: assignments.allocatedHi,
      selectedPlatforms: assignments.selectedPlatforms,
      scheduledDate: assignments.scheduledDate,
      scheduleType: assignments.scheduleTypeField,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
      role: assignments.role,
      declineReason: assignments.declineReason,
      responseDueAt: assignments.responseDueAt,
      createdAt: assignments.createdAt,
      contentBrief: briefings.contentBrief,
      offerDescription: briefings.offerDescription,
      availabilityDays: briefings.availabilityDays,
      availabilityMeals: briefings.availabilityMeals,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
      postId: posts.id,
      postUrl: posts.postUrl,
      postPlatform: posts.platform,
      likes: posts.likes,
      comments: posts.comments,
      saves: posts.saves,
      shares: posts.shares,
      reach: posts.reach,
      hiCalculated: posts.hiCalculated,
      postedAt: posts.postedAt,
      measuredAt: posts.measuredAt,
    })
    .from(assignments)
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.id, assignmentId));

  if (rows.length === 0) return null;

  const first = rows[0];
  const assignmentPosts = rows
    .filter((r) => r.postId !== null)
    .map((r) => ({
      id: r.postId!,
      platform: r.postPlatform!,
      postUrl: r.postUrl,
      likes: r.likes,
      comments: r.comments,
      saves: r.saves,
      shares: r.shares,
      reach: r.reach,
      hiCalculated: r.hiCalculated,
      postedAt: r.postedAt,
      measuredAt: r.measuredAt,
    }));

  return {
    id: first.id,
    status: first.status,
    allocatedHi: first.allocatedHi,
    selectedPlatforms: (first.selectedPlatforms as string[]) ?? [],
    scheduledDate: first.scheduledDate,
    scheduleType: first.scheduleType,
    scheduleTimeStart: first.scheduleTimeStart,
    scheduleTimeEnd: first.scheduleTimeEnd,
    role: first.role,
    declineReason: first.declineReason,
    responseDueAt: first.responseDueAt,
    createdAt: first.createdAt,
    contentBrief: first.contentBrief,
    offerDescription: first.offerDescription,
    availabilityDays: first.availabilityDays,
    availabilityMeals: first.availabilityMeals,
    businessName: first.businessName,
    address: first.address,
    verified: first.verified,
    posts: assignmentPosts,
  };
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: "accepted" | "declined" | "scheduled" | "posted" | "measured" | "paid",
) {
  const [updated] = await db
    .update(assignments)
    .set({ status })
    .where(eq(assignments.id, assignmentId))
    .returning();
  return updated ?? null;
}

// ── Briefing Mutations ────────────────────────────────────────────

export async function createBriefing(data: {
  brandId: string;
  contentBrief: string;
  offerDescription?: string;
  availabilityDays: string[];
  availabilityMeals: string[];
  budgetHi: string;
  responseHours?: number;
}) {
  const [created] = await db
    .insert(briefings)
    .values({
      brandId: data.brandId,
      contentBrief: data.contentBrief,
      offerDescription: data.offerDescription ?? null,
      availabilityDays: data.availabilityDays,
      availabilityMeals: data.availabilityMeals,
      budgetHi: data.budgetHi,
      responseHours: data.responseHours ?? 72,
      status: "active",
    })
    .returning();
  return created;
}

export async function updateBriefing(
  briefingId: string,
  data: Partial<{
    contentBrief: string;
    offerDescription: string;
    availabilityDays: string[];
    availabilityMeals: string[];
    budgetHi: string;
    budgetType: "per_engagement" | "monthly";
    responseHours: number;
    status: "active" | "paused" | "completed";
  }>,
) {
  const set: Record<string, unknown> = {};
  if (data.contentBrief !== undefined) set.contentBrief = data.contentBrief;
  if (data.offerDescription !== undefined) set.offerDescription = data.offerDescription;
  if (data.availabilityDays !== undefined) set.availabilityDays = data.availabilityDays;
  if (data.availabilityMeals !== undefined) set.availabilityMeals = data.availabilityMeals;
  if (data.budgetHi !== undefined) set.budgetHi = data.budgetHi;
  if (data.budgetType !== undefined) set.budgetTypeField = data.budgetType;
  if (data.responseHours !== undefined) set.responseHours = data.responseHours;
  if (data.status !== undefined) set.status = data.status;

  const [updated] = await db
    .update(briefings)
    .set(set)
    .where(eq(briefings.id, briefingId))
    .returning();
  return updated ?? null;
}

// ── Post / Metrics Queries ────────────────────────────────────────

export async function getPostByAssignmentId(assignmentId: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.assignmentId, assignmentId));
  return post ?? null;
}

export async function updatePostMetrics(
  postId: string,
  metrics: { likes: number; comments: number; saves: number; shares: number; reach: number },
  hiCalculated: string,
) {
  const [updated] = await db
    .update(posts)
    .set({
      likes: metrics.likes,
      comments: metrics.comments,
      saves: metrics.saves,
      shares: metrics.shares,
      reach: metrics.reach,
      hiCalculated,
      measuredAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();
  return updated ?? null;
}

export async function updateBriefingHiDelivered(briefingId: string, hiToAdd: number) {
  const briefing = await getBrandBriefing_byId(briefingId);
  if (!briefing) return null;
  const current = parseFloat(briefing.hiDelivered);
  const [updated] = await db
    .update(briefings)
    .set({ hiDelivered: (current + hiToAdd).toFixed(2) })
    .where(eq(briefings.id, briefingId))
    .returning();
  return updated ?? null;
}

async function getBrandBriefing_byId(briefingId: string) {
  const [b] = await db.select().from(briefings).where(eq(briefings.id, briefingId));
  return b ?? null;
}

/** Get HI delivered this calendar month for a briefing */
export async function getCurrentMonthHi(briefingId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await db
    .select({ total: sum(posts.hiCalculated) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(
      and(
        eq(assignments.briefingId, briefingId),
        sql`${posts.measuredAt} >= ${monthStart}`,
      ),
    );

  return parseFloat(result?.total ?? "0");
}

/** Get all-time HI delivered for a briefing */
export async function getAllTimeHi(briefingId: string) {
  const [result] = await db
    .select({ total: sum(posts.hiCalculated) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.briefingId, briefingId));

  return parseFloat(result?.total ?? "0");
}

// ── Payout Mutations ──────────────────────────────────────────────

export async function createPayout(data: {
  assignmentId: string;
  amount: string;
  hiAmount: string;
}) {
  const [created] = await db
    .insert(payouts)
    .values({
      assignmentId: data.assignmentId,
      amount: data.amount,
      hiAmount: data.hiAmount,
      status: "pending",
    })
    .returning();
  return created;
}

export async function getPayoutByAssignmentId(assignmentId: string) {
  const [payout] = await db
    .select()
    .from(payouts)
    .where(eq(payouts.assignmentId, assignmentId));
  return payout ?? null;
}

export async function updatePayoutStatus(
  payoutId: string,
  status: "paid" | "cancelled",
  stripeTransferId?: string,
) {
  const set: Record<string, unknown> = { status };
  if (status === "paid") set.paidAt = new Date();
  if (stripeTransferId) set.stripeTransferId = stripeTransferId;

  const [updated] = await db
    .update(payouts)
    .set(set)
    .where(eq(payouts.id, payoutId))
    .returning();
  return updated ?? null;
}

// ── HIG Data ──────────────────────────────────────────────────────

export async function getCreatorHIGData(userId: string) {
  const [hiStats] = await db
    .select({
      avgHi: avg(posts.hiCalculated),
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(and(eq(assignments.creatorId, userId), sql`${posts.hiCalculated} IS NOT NULL`));

  const [assignmentStats] = await db
    .select({
      paid: count(sql`CASE WHEN ${assignments.status} = 'paid' THEN 1 END`),
      total: count(sql`CASE WHEN ${assignments.status} != 'declined' THEN 1 END`),
    })
    .from(assignments)
    .where(eq(assignments.creatorId, userId));

  return {
    avgHi: parseFloat(hiStats?.avgHi ?? "0"),
    paidAssignments: assignmentStats?.paid ?? 0,
    totalNonDeclinedAssignments: assignmentStats?.total ?? 0,
  };
}

// ── Profile Updates ───────────────────────────────────────────────

export async function updateCreatorProfile(
  userId: string,
  data: Partial<{
    handle: string;
    location: string;
    primaryPlatform: string;
    platforms: string[];
  }>,
) {
  const set: Record<string, unknown> = {};
  if (data.handle !== undefined) set.handle = data.handle;
  if (data.location !== undefined) set.location = data.location;
  if (data.primaryPlatform !== undefined) set.primaryPlatform = data.primaryPlatform;
  if (data.platforms !== undefined) set.platforms = data.platforms;

  const [updated] = await db
    .update(users)
    .set(set)
    .where(eq(users.id, userId))
    .returning();
  return updated ?? null;
}

export async function updateBrandProfile(
  brandId: string,
  data: Partial<{
    businessName: string;
    address: string;
    instagramHandle: string;
  }>,
) {
  const set: Record<string, unknown> = {};
  if (data.businessName !== undefined) set.businessName = data.businessName;
  if (data.address !== undefined) set.address = data.address;
  if (data.instagramHandle !== undefined) set.instagramHandle = data.instagramHandle;

  const [updated] = await db
    .update(brands)
    .set(set)
    .where(eq(brands.id, brandId))
    .returning();
  return updated ?? null;
}

export async function updateCreatorHIG(userId: string, higScore: number) {
  const [updated] = await db
    .update(users)
    .set({ higScore })
    .where(eq(users.id, userId))
    .returning();
  return updated ?? null;
}

// ── Influence Graph Queries ──────────────────────────────────────

export async function getInfluencePropagation(creatorId: string) {
  return db
    .select()
    .from(propagationEvents)
    .where(
      sql`${propagationEvents.sourceCreatorId} = ${creatorId} OR ${propagationEvents.targetCreatorId} = ${creatorId}`,
    )
    .orderBy(desc(propagationEvents.createdAt));
}

export async function getAmplifiersForCreator(creatorId: string) {
  const rows = await db
    .select({
      handle: users.handle,
      avatar: users.avatar,
      totalHi: sum(propagationEvents.hiAmount),
    })
    .from(propagationEvents)
    .innerJoin(users, eq(propagationEvents.sourceCreatorId, users.id))
    .where(
      and(
        eq(propagationEvents.targetCreatorId, creatorId),
        eq(propagationEvents.type, 'amplification'),
      ),
    )
    .groupBy(users.id, users.handle, users.avatar);

  return rows.map((r) => ({
    handle: r.handle,
    avatar: r.avatar ?? r.handle.charAt(0).toUpperCase(),
    hi: parseFloat(r.totalHi ?? "0"),
  }));
}

export async function getCreatorReach(creatorId: string) {
  const [result] = await db
    .select({ total: sum(posts.reach) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(and(eq(assignments.creatorId, creatorId), sql`${posts.reach} IS NOT NULL`));

  return parseInt(result?.total ?? "0");
}

export async function getCreatorAvgHi(creatorId: string) {
  const [result] = await db
    .select({ avgHi: avg(posts.hiCalculated) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(and(eq(assignments.creatorId, creatorId), sql`${posts.hiCalculated} IS NOT NULL`));

  return parseFloat(result?.avgHi ?? "0");
}

export async function getReferralsByReferrer(userId: string) {
  return db
    .select({
      id: referrals.id,
      referredId: referrals.referredId,
      referralCode: referrals.referralCode,
      createdAt: referrals.createdAt,
      expiresAt: referrals.expiresAt,
      referredHandle: users.handle,
    })
    .from(referrals)
    .innerJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
}

export async function getNetworkHi(userId: string) {
  const [result] = await db
    .select({ total: sum(propagationEvents.hiAmount) })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.targetCreatorId, userId),
        eq(propagationEvents.type, 'referral_hi'),
      ),
    );

  return parseFloat(result?.total ?? "0");
}

export async function getNetworkEarnings(userId: string) {
  const networkHi = await getNetworkHi(userId);
  const grossUsd = networkHi * PRICE_PER_HI;
  const networkUsd = grossUsd * (NETWORK_SPLIT.creatorRecruiter / 100);
  return networkUsd;
}

export async function createPropagationEvent(data: {
  type: 'amplification' | 'referral_hi' | 'network_boost';
  sourcePostId?: string;
  sourceCreatorId: string;
  targetCreatorId: string;
  briefingId?: string;
  hiAmount: string;
}) {
  const [created] = await db
    .insert(propagationEvents)
    .values({
      type: data.type,
      sourcePostId: data.sourcePostId ?? null,
      sourceCreatorId: data.sourceCreatorId,
      targetCreatorId: data.targetCreatorId,
      briefingId: data.briefingId ?? null,
      hiAmount: data.hiAmount,
    })
    .returning();
  return created;
}

export async function createReferral(data: {
  referrerId: string;
  referredId: string;
  referralCode: string;
}) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 24);

  const [created] = await db
    .insert(referrals)
    .values({
      referrerId: data.referrerId,
      referredId: data.referredId,
      referralCode: data.referralCode,
      expiresAt,
    })
    .returning();
  return created;
}

// ── Open Campaign Queries ────────────────────────────────────────

export async function getOpenBriefings() {
  const rows = await db
    .select({
      id: briefings.id,
      brandId: briefings.brandId,
      contentBrief: briefings.contentBrief,
      offerDescription: briefings.offerDescription,
      budgetHi: briefings.budgetHi,
      hiDelivered: briefings.hiDelivered,
      createdAt: briefings.createdAt,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
    })
    .from(briefings)
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .where(
      and(
        eq(briefings.visibility, 'open'),
        eq(briefings.status, 'active'),
      ),
    )
    .orderBy(desc(briefings.createdAt));

  return rows;
}

export async function getCreatorOpenAssignment(creatorId: string, briefingId: string) {
  const [existing] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.creatorId, creatorId),
        eq(assignments.briefingId, briefingId),
      ),
    );
  return existing ?? null;
}

export async function createSelfAssignment(data: {
  briefingId: string;
  creatorId: string;
}) {
  const [created] = await db
    .insert(assignments)
    .values({
      briefingId: data.briefingId,
      creatorId: data.creatorId,
      status: 'accepted',
      role: 'originator',
    })
    .returning();
  return created;
}

// ── Amplification Queries ────────────────────────────────────────

export async function getAmplificationOpportunities(creatorId: string) {
  // Posts by other creators for active briefings, measured, not already at 5 amplifiers
  const measuredPosts = await db
    .select({
      postId: posts.id,
      postUrl: posts.postUrl,
      hiCalculated: posts.hiCalculated,
      creatorHandle: users.handle,
      creatorAvatar: users.avatar,
      businessName: brands.businessName,
      briefingId: briefings.id,
      assignmentId: assignments.id,
      creatorId: assignments.creatorId,
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .innerJoin(briefings, eq(assignments.briefingId, briefings.id))
    .innerJoin(brands, eq(briefings.brandId, brands.id))
    .where(
      and(
        ne(assignments.creatorId, creatorId),
        eq(briefings.status, 'active'),
        sql`${posts.hiCalculated} IS NOT NULL`,
      ),
    )
    .orderBy(desc(posts.measuredAt));

  // Filter out posts already at max amplifiers
  const results = [];
  for (const post of measuredPosts) {
    const ampCount = await getAmplificationsByPost(post.postId);
    // Check if this creator already amplified this post
    const [alreadyAmped] = await db
      .select()
      .from(propagationEvents)
      .where(
        and(
          eq(propagationEvents.sourceCreatorId, creatorId),
          eq(propagationEvents.sourcePostId, post.postId),
          eq(propagationEvents.type, 'amplification'),
        ),
      );
    if (ampCount < 5 && !alreadyAmped) {
      results.push({
        ...post,
        amplifierCount: ampCount,
        potentialHi: parseFloat(post.hiCalculated ?? "0") * 0.30,
      });
    }
  }
  return results;
}

export async function getAmplificationsByPost(postId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.sourcePostId, postId),
        eq(propagationEvents.type, 'amplification'),
      ),
    );
  return result?.count ?? 0;
}

export async function getCreatorAmplificationTotal(creatorId: string, briefingId: string) {
  const [result] = await db
    .select({ total: sum(propagationEvents.hiAmount) })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.sourceCreatorId, creatorId),
        eq(propagationEvents.briefingId, briefingId),
        eq(propagationEvents.type, 'amplification'),
      ),
    );
  return parseFloat(result?.total ?? "0");
}

export async function getCreatorAmplificationEffectiveness(creatorId: string) {
  // Ratio of amplification HI given vs available opportunities
  const [given] = await db
    .select({ total: sum(propagationEvents.hiAmount) })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.sourceCreatorId, creatorId),
        eq(propagationEvents.type, 'amplification'),
      ),
    );

  const totalGiven = parseFloat(given?.total ?? "0");
  // Normalize: 10 HI of amplification given = 100 score
  return Math.min(100, (totalGiven / 10) * 100);
}

// ── Neighborhood Queries ─────────────────────────────────────────

export async function getNeighborhoodHi(neighborhood: string, windowDays = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);

  const [result] = await db
    .select({ total: sum(posts.hiCalculated) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .where(
      and(
        eq(users.neighborhood, neighborhood),
        sql`${posts.measuredAt} >= ${cutoff}`,
        sql`${posts.hiCalculated} IS NOT NULL`,
      ),
    );

  return parseFloat(result?.total ?? "0");
}

export async function getNeighborhoodCreatorCount(neighborhood: string) {
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.neighborhood, neighborhood),
        eq(users.role, 'influencer'),
      ),
    );
  return result?.count ?? 0;
}

export async function getCreatorCityRank(creatorId: string) {
  // Rank creators by total HI (all measured posts)
  const allCreators = await db
    .select({
      creatorId: assignments.creatorId,
      totalHi: sum(posts.hiCalculated),
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .where(
      and(
        eq(users.role, 'influencer'),
        sql`${posts.hiCalculated} IS NOT NULL`,
      ),
    )
    .groupBy(assignments.creatorId)
    .orderBy(sql`sum(${posts.hiCalculated}) DESC`);

  const rank = allCreators.findIndex((c) => c.creatorId === creatorId);
  return rank === -1 ? allCreators.length + 1 : rank + 1;
}

// ── Notification Queries ─────────────────────────────────────────

export async function getNotifications(userId: string, unreadOnly = false) {
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );
  return result?.count ?? 0;
}

export async function createNotification(data: {
  userId: string;
  type: 'new_opportunity' | 'amplification_received' | 'milestone' | 'payout_ready' | 'campaign_update' | 'rank_change';
  title: string;
  body: string;
  metadata?: unknown;
}) {
  const [created] = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      metadata: data.metadata ?? null,
    })
    .returning();
  return created;
}

export async function markNotificationRead(notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId))
    .returning();
  return updated ?? null;
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );
}

// ── Briefing by ID (for open campaign validation) ────────────────

export async function getBriefingById(briefingId: string) {
  const [b] = await db.select().from(briefings).where(eq(briefings.id, briefingId));
  return b ?? null;
}

// ── Brand-Facing Influence Queries ──────────────────────────────

export async function getBriefingInfluenceSpread(briefingId: string) {
  // Creators who posted
  const postedAssignments = await db
    .select({ creatorId: assignments.creatorId })
    .from(assignments)
    .innerJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(eq(assignments.briefingId, briefingId))
    .groupBy(assignments.creatorId);

  const creatorsPosted = postedAssignments.length;

  // Amplifications for this briefing
  const [ampStats] = await db
    .select({
      ampCount: count(),
      secondaryCreators: count(sql`DISTINCT ${propagationEvents.sourceCreatorId}`),
    })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.briefingId, briefingId),
        eq(propagationEvents.type, 'amplification'),
      ),
    );

  // Total reach from all posts in briefing
  const [reachStats] = await db
    .select({ totalReach: sum(posts.reach) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(
      and(
        eq(assignments.briefingId, briefingId),
        sql`${posts.reach} IS NOT NULL`,
      ),
    );

  return {
    creatorsPosted,
    amplificationCount: ampStats?.ampCount ?? 0,
    secondaryCreators: ampStats?.secondaryCreators ?? 0,
    totalCreatorReach: parseInt(reachStats?.totalReach ?? "0"),
  };
}

export async function getBriefingCreatorRanking(briefingId: string) {
  const rows = await db
    .select({
      creatorId: assignments.creatorId,
      handle: users.handle,
      avatar: users.avatar,
      followersCount: users.followersCount,
      neighborhood: users.neighborhood,
      higScore: users.higScore,
      primaryPlatform: users.primaryPlatform,
      totalHi: sum(posts.hiCalculated),
      postCount: count(posts.id),
      totalReach: sum(posts.reach),
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .innerJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(
      and(
        eq(assignments.briefingId, briefingId),
        sql`${posts.hiCalculated} IS NOT NULL`,
      ),
    )
    .groupBy(assignments.creatorId, users.id, users.handle, users.avatar, users.followersCount, users.neighborhood, users.higScore, users.primaryPlatform)
    .orderBy(sql`sum(${posts.hiCalculated}) DESC`);

  // Get amplifications received per creator for this briefing
  const results = [];
  for (const row of rows) {
    const [ampReceived] = await db
      .select({ count: count() })
      .from(propagationEvents)
      .where(
        and(
          eq(propagationEvents.targetCreatorId, row.creatorId),
          eq(propagationEvents.briefingId, briefingId),
          eq(propagationEvents.type, 'amplification'),
        ),
      );

    results.push({
      handle: row.handle,
      avatar: row.avatar,
      followersCount: row.followersCount,
      neighborhood: row.neighborhood,
      higScore: row.higScore,
      primaryPlatform: row.primaryPlatform ?? "instagram",
      totalHi: parseFloat(row.totalHi ?? "0"),
      postCount: row.postCount,
      totalReach: parseInt(row.totalReach ?? "0"),
      amplificationsReceived: ampReceived?.count ?? 0,
    });
  }

  return results;
}

export async function getBriefingNeighborhoodCoverage(briefingId: string) {
  const rows = await db
    .select({
      neighborhood: users.neighborhood,
      creatorCount: count(sql`DISTINCT ${assignments.creatorId}`),
      totalReach: sum(posts.reach),
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .where(
      and(
        eq(assignments.briefingId, briefingId),
        sql`${users.neighborhood} IS NOT NULL`,
      ),
    )
    .groupBy(users.neighborhood)
    .orderBy(sql`sum(${posts.reach}) DESC NULLS LAST`);

  return rows.map((r) => ({
    neighborhood: r.neighborhood ?? "Unknown",
    creatorCount: r.creatorCount,
    totalReach: parseInt(r.totalReach ?? "0"),
  }));
}

export async function getBrandCreatorSchedule(briefingId: string) {
  const now = new Date();
  const rows = await db
    .select({
      creatorHandle: users.handle,
      scheduledDate: assignments.scheduledDate,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.creatorId, users.id))
    .where(
      and(
        eq(assignments.briefingId, briefingId),
        sql`${assignments.status} IN ('accepted', 'scheduled')`,
        sql`${assignments.scheduledDate} > ${now}`,
      ),
    )
    .orderBy(assignments.scheduledDate)
    .limit(7);

  return rows;
}

export async function getBrandTrendScore(brandId: string) {
  const brand = await getBrandByUserId_byBrandId(brandId);
  if (!brand?.address) return { neighborhood: "Unknown", trendLabel: "Active", isRising: false };

  // Parse neighborhood from address (e.g. "8906 Melrose Ave, West Hollywood, CA" -> "West Hollywood")
  const parts = brand.address.split(",");
  const neighborhood = parts.length >= 2 ? parts[parts.length - 2].trim().replace(/\s+CA$/, "").replace(/\s+\d{5}.*/, "") : "Unknown";

  // Check recent HI + amplifications in last 14 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const briefing = await getBrandBriefing(brandId);
  if (!briefing) return { neighborhood, trendLabel: "Active", isRising: false };

  const [recentHi] = await db
    .select({ total: sum(posts.hiCalculated) })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .where(
      and(
        eq(assignments.briefingId, briefing.id),
        sql`${posts.measuredAt} >= ${cutoff}`,
        sql`${posts.hiCalculated} IS NOT NULL`,
      ),
    );

  const [recentAmps] = await db
    .select({ count: count() })
    .from(propagationEvents)
    .where(
      and(
        eq(propagationEvents.briefingId, briefing.id),
        sql`${propagationEvents.createdAt} >= ${cutoff}`,
      ),
    );

  const totalRecentHi = parseFloat(recentHi?.total ?? "0");
  const ampCount = recentAmps?.count ?? 0;
  const isRising = totalRecentHi > 5 || ampCount > 1;

  return {
    neighborhood,
    trendLabel: isRising ? `Rising in ${neighborhood}` : `Active in ${neighborhood}`,
    isRising,
  };
}

async function getBrandByUserId_byBrandId(brandId: string) {
  const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
  return brand ?? null;
}
