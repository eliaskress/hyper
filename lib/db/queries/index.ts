import { db } from "@/lib/db";
import { users, brands, briefings, assignments, posts, payouts, badges } from "@/lib/db/schema";
import { eq, desc, count, sum, sql, and } from "drizzle-orm";

// ── Creator Queries ─────────────────────────────────────────────────

export async function getCreatorAssignments(userId: string) {
  return db
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
  const [result] = await db
    .select({
      id: assignments.id,
      status: assignments.status,
      allocatedHi: assignments.allocatedHi,
      scheduledDate: assignments.scheduledDate,
      scheduleType: assignments.scheduleTypeField,
      scheduleTimeStart: assignments.scheduleTimeStart,
      scheduleTimeEnd: assignments.scheduleTimeEnd,
      role: assignments.role,
      declineReason: assignments.declineReason,
      createdAt: assignments.createdAt,
      contentBrief: briefings.contentBrief,
      availabilityDays: briefings.availabilityDays,
      availabilityMeals: briefings.availabilityMeals,
      businessName: brands.businessName,
      address: brands.address,
      verified: brands.verified,
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
  return result ?? null;
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
