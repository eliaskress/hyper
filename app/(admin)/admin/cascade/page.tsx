import { db } from '@/lib/db';
import {
  brands,
  posts,
  assignments,
  briefings,
  cascadeEvents,
  users,
} from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function CascadePage() {
  // CCR by brand: for each brand, count measured posts and cascade-triggering posts
  const brandStats = await db
    .select({
      brandId: brands.id,
      businessName: brands.businessName,
      totalPosts: sql<number>`count(distinct ${posts.id})::int`,
      cascadePosts:
        sql<number>`count(distinct case when ${posts.cascadeTriggered} = true then ${posts.id} end)::int`,
    })
    .from(brands)
    .leftJoin(briefings, eq(briefings.brandId, brands.id))
    .leftJoin(assignments, eq(assignments.briefingId, briefings.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .groupBy(brands.id, brands.businessName)
    .orderBy(desc(sql`count(distinct case when ${posts.cascadeTriggered} = true then ${posts.id} end)`));

  // Also get cascade event counts per brand (from cascadeEvents table directly)
  const cascadeCounts = await db
    .select({
      brandId: cascadeEvents.brandId,
      count: sql<number>`count(*)::int`,
    })
    .from(cascadeEvents)
    .groupBy(cascadeEvents.brandId);

  const cascadeCountMap = new Map(
    cascadeCounts.map((c) => [c.brandId, c.count])
  );

  const brandRows = brandStats.map((b) => ({
    ...b,
    cascadeEvents: cascadeCountMap.get(b.brandId) ?? 0,
    ccrRate:
      b.totalPosts > 0
        ? ((b.cascadePosts / b.totalPosts) * 100).toFixed(1)
        : '0.0',
  }));

  // Full cascade event log
  const eventLog = await db
    .select({
      id: cascadeEvents.id,
      hoursElapsed: cascadeEvents.hoursElapsed,
      detectionMethod: cascadeEvents.detectionMethod,
      detectedAt: cascadeEvents.detectedAt,
      brandId: cascadeEvents.brandId,
      sourcePostId: cascadeEvents.sourcePostId,
      triggeredPostId: cascadeEvents.triggeredPostId,
    })
    .from(cascadeEvents)
    .orderBy(desc(cascadeEvents.detectedAt))
    .limit(50);

  // Enrich event log with creator handles and brand names
  const enrichedEvents = await Promise.all(
    eventLog.map(async (event) => {
      const [sourceRow] = await db
        .select({ handle: users.handle })
        .from(posts)
        .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
        .innerJoin(users, eq(assignments.creatorId, users.id))
        .where(eq(posts.id, event.sourcePostId));

      const [triggeredRow] = await db
        .select({ handle: users.handle })
        .from(posts)
        .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
        .innerJoin(users, eq(assignments.creatorId, users.id))
        .where(eq(posts.id, event.triggeredPostId));

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Cascade Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          How influence propagates across creators within brand campaigns.
        </p>
      </div>

      {/* CCR by brand */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">CCR by Brand</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Brand</th>
              <th className="px-6 py-3 font-medium text-right">Posts</th>
              <th className="px-6 py-3 font-medium text-right">
                Cascade Events
              </th>
              <th className="px-6 py-3 font-medium text-right">
                Trigger Posts
              </th>
              <th className="px-6 py-3 font-medium text-right">CCR</th>
            </tr>
          </thead>
          <tbody>
            {brandRows.map((row) => (
              <tr
                key={row.brandId}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-3 font-medium text-gray-900">
                  {row.businessName}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {row.totalPosts}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {row.cascadeEvents}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {row.cascadePosts}
                </td>
                <td className="px-6 py-3 font-semibold text-gray-900 text-right">
                  {row.ccrRate}%
                </td>
              </tr>
            ))}
            {brandRows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-6 text-center text-gray-400"
                >
                  No brand data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cascade event log */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Cascade Event Log
          </h3>
          <p className="text-xs text-gray-400 mt-1">Last 50 events</p>
        </div>
        {enrichedEvents.length === 0 ? (
          <div className="p-6 text-sm text-gray-400 text-center">
            No cascade events recorded yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Source Creator</th>
                <th className="px-6 py-3 font-medium">Triggered Creator</th>
                <th className="px-6 py-3 font-medium">Brand</th>
                <th className="px-6 py-3 font-medium text-right">Hours</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {enrichedEvents.map((event) => (
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
                  <td className="px-6 py-3 text-gray-600 text-right">
                    {event.hoursElapsed.toFixed(1)}h
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        event.detectionMethod === 'auto'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {event.detectionMethod}
                    </span>
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
    </div>
  );
}
