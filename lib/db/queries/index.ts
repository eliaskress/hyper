import { db } from "@/lib/db";
import { users, brands, briefings, assignments, posts, payouts, badges } from "@/lib/db/schema";
import { eq, desc, count, sum, avg, sql, and } from "drizzle-orm";

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
      avatar: users.avatar,
      followersCount: users.followersCount,
      location: users.location,
      stripeAccountId: users.stripeAccountId,
      xp: users.xp,
      tier: users.tier,
      higScore: users.higScore,
      primaryPlatform: users.primaryPlatform,
      platforms: users.platforms,
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
