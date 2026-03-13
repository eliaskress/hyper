import Link from 'next/link';
import { db } from '@/lib/db';
import {
  brands,
  users,
  posts,
  cascadeEvents,
  assignments,
} from '@/lib/db/schema';
import { eq, sql, desc, isNotNull } from 'drizzle-orm';
import { calculateCCR } from '@/lib/metrics';
import { calculateBudgetReinvestmentRate } from '@/lib/metrics';
import { calculateCreatorReturnRate } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  // Pilot status counts
  const [restaurantCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(brands);

  const [creatorCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, 'influencer'));

  const [postCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(isNotNull(posts.postedAt));

  // Metrics - CCR for last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ccr = await calculateCCR({ startDate: thirtyDaysAgo, endDate: now });

  // Budget Reinvestment Rate
  const reinvestment = await calculateBudgetReinvestmentRate();

  // Creator Return Rate
  const returnRate = await calculateCreatorReturnRate();

  // Recent cascade events (last 10)
  const recentCascades = await db
    .select({
      id: cascadeEvents.id,
      hoursElapsed: cascadeEvents.hoursElapsed,
      detectedAt: cascadeEvents.detectedAt,
      detectionMethod: cascadeEvents.detectionMethod,
      brandId: cascadeEvents.brandId,
      sourcePostId: cascadeEvents.sourcePostId,
      triggeredPostId: cascadeEvents.triggeredPostId,
    })
    .from(cascadeEvents)
    .orderBy(desc(cascadeEvents.detectedAt))
    .limit(10);

  // Enrich cascade events with creator handles and brand names
  const enrichedCascades = await Promise.all(
    recentCascades.map(async (event) => {
      // Source creator
      const [sourceRow] = await db
        .select({ handle: users.handle })
        .from(posts)
        .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
        .innerJoin(users, eq(assignments.creatorId, users.id))
        .where(eq(posts.id, event.sourcePostId));

      // Triggered creator
      const [triggeredRow] = await db
        .select({ handle: users.handle })
        .from(posts)
        .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
        .innerJoin(users, eq(assignments.creatorId, users.id))
        .where(eq(posts.id, event.triggeredPostId));

      // Brand name
      const [brandRow] = await db
        .select({ businessName: brands.businessName })
        .from(brands)
        .where(eq(brands.id, event.brandId));

      return {
        ...event,
        sourceHandle: sourceRow?.handle ?? 'Unknown',
        triggeredHandle: triggeredRow?.handle ?? 'Unknown',
        brandName: brandRow?.businessName ?? 'Unknown',
      };
    })
  );

  const ccrLabelColors: Record<string, string> = {
    early: 'bg-yellow-100 text-yellow-800',
    promising: 'bg-blue-100 text-blue-800',
    breakout: 'bg-green-100 text-green-800',
  };

  const reinvestmentLabelColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    building: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Launch Command Center
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          LA pilot metrics, updated in real time.
        </p>
      </div>

      {/* Pilot status bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-6 text-sm">
        <span className="font-medium text-gray-900">Pilot status:</span>
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">
            {restaurantCount.count}
          </span>{' '}
          restaurants
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">
            {creatorCount.count}
          </span>{' '}
          creators
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">
            {postCount.count}
          </span>{' '}
          posts
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* CCR card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Cascade Contagion Rate
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {(ccr.rate * 100).toFixed(1)}%
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${ccrLabelColors[ccr.label]}`}
            >
              {ccr.label}
            </span>
            <span className="text-xs text-gray-400">
              {ccr.numerator}/{ccr.denominator} posts
            </span>
          </div>
        </div>

        {/* Budget Reinvestment Rate card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Budget Reinvestment Rate
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {(reinvestment.rate * 100).toFixed(1)}%
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${reinvestmentLabelColors[reinvestment.label]}`}
            >
              {reinvestment.label}
            </span>
            <span className="text-xs text-gray-400">
              {reinvestment.brandsWithIncrease}/
              {reinvestment.brandsWith2PlusBriefings} brands
            </span>
          </div>
        </div>

        {/* Creator Return Rate card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Creator Return Rate
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {(returnRate.returnRate * 100).toFixed(1)}%
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-400">
              {returnRate.creatorsWithReturn}/
              {returnRate.totalActiveCreators} creators
            </span>
          </div>
        </div>
      </div>

      {/* Recent cascade events */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent Cascade Events
          </h3>
        </div>
        {enrichedCascades.length === 0 ? (
          <div className="p-6 text-sm text-gray-400 text-center">
            No cascade events detected yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Triggered</th>
                <th className="px-6 py-3 font-medium">Brand</th>
                <th className="px-6 py-3 font-medium">Hours</th>
                <th className="px-6 py-3 font-medium">Detected</th>
              </tr>
            </thead>
            <tbody>
              {enrichedCascades.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    @{event.sourceHandle}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    @{event.triggeredHandle}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {event.brandName}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {event.hoursElapsed.toFixed(1)}h
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {event.detectedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/admin/cascade"
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-sm"
        >
          <p className="font-semibold text-gray-900">Cascade Deep Dive</p>
          <p className="text-gray-500 mt-1">CCR by brand, full event log</p>
        </Link>
        <Link
          href="/admin/restaurants"
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-sm"
        >
          <p className="font-semibold text-gray-900">Restaurant Tracker</p>
          <p className="text-gray-500 mt-1">
            Briefings, posts, HI, budget trends
          </p>
        </Link>
        <Link
          href="/admin/creators"
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-sm"
        >
          <p className="font-semibold text-gray-900">Creator Tracker</p>
          <p className="text-gray-500 mt-1">
            HIG, collabs, cascade rate, payouts
          </p>
        </Link>
      </div>
    </div>
  );
}
