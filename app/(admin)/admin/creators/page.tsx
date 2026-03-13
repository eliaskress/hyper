import { db } from '@/lib/db';
import {
  users,
  assignments,
  posts,
  payouts,
  creatorEngagements,
} from '@/lib/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage() {
  // All creators
  const creators = await db
    .select({
      id: users.id,
      handle: users.handle,
      higScore: users.higScore,
    })
    .from(users)
    .where(eq(users.role, 'influencer'))
    .orderBy(users.handle);

  // Total collabs per creator (assignments with status in paid, measured, posted)
  const collabCounts = await db
    .select({
      creatorId: assignments.creatorId,
      count: sql<number>`count(*)::int`,
    })
    .from(assignments)
    .where(inArray(assignments.status, ['paid', 'measured', 'posted']))
    .groupBy(assignments.creatorId);

  const collabMap = new Map(
    collabCounts.map((c) => [c.creatorId, c.count])
  );

  // Cascade rate per creator: posts with cascadeTriggered = true / total posts
  const creatorPostStats = await db
    .select({
      creatorId: assignments.creatorId,
      totalPosts: sql<number>`count(distinct ${posts.id})::int`,
      cascadePosts:
        sql<number>`count(distinct case when ${posts.cascadeTriggered} = true then ${posts.id} end)::int`,
    })
    .from(posts)
    .innerJoin(assignments, eq(posts.assignmentId, assignments.id))
    .groupBy(assignments.creatorId);

  const postStatsMap = new Map(
    creatorPostStats.map((s) => [
      s.creatorId,
      { total: s.totalPosts, cascade: s.cascadePosts },
    ])
  );

  // Return collabs: creators with engagementNumber >= 2
  const returnCreators = await db
    .select({
      creatorId: creatorEngagements.creatorId,
    })
    .from(creatorEngagements)
    .where(sql`${creatorEngagements.engagementNumber} >= 2`)
    .groupBy(creatorEngagements.creatorId);

  const returnSet = new Set(returnCreators.map((r) => r.creatorId));

  // Total payouts per creator (sum from payouts through assignments)
  const creatorPayouts = await db
    .select({
      creatorId: assignments.creatorId,
      totalPayout: sql<string>`coalesce(sum(${payouts.amount}::numeric), 0)`,
    })
    .from(payouts)
    .innerJoin(assignments, eq(payouts.assignmentId, assignments.id))
    .where(eq(payouts.status, 'paid'))
    .groupBy(assignments.creatorId);

  const payoutMap = new Map(
    creatorPayouts.map((p) => [p.creatorId, parseFloat(p.totalPayout)])
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Creators</h2>
        <p className="text-sm text-gray-500 mt-1">
          All creators in the network with performance data.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Handle</th>
              <th className="px-6 py-3 font-medium text-right">HIG</th>
              <th className="px-6 py-3 font-medium text-right">Collabs</th>
              <th className="px-6 py-3 font-medium text-right">
                Cascade Rate
              </th>
              <th className="px-6 py-3 font-medium text-center">
                Return Collab
              </th>
              <th className="px-6 py-3 font-medium text-right">
                Total Payouts
              </th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => {
              const stats = postStatsMap.get(creator.id);
              const cascadeRate =
                stats && stats.total > 0
                  ? ((stats.cascade / stats.total) * 100).toFixed(1)
                  : '0.0';
              const isReturn = returnSet.has(creator.id);
              const totalPayout = payoutMap.get(creator.id) ?? 0;

              return (
                <tr
                  key={creator.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    @{creator.handle}
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-right">
                    {creator.higScore}
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-right">
                    {collabMap.get(creator.id) ?? 0}
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-right">
                    {cascadeRate}%
                  </td>
                  <td className="px-6 py-3 text-center">
                    {isReturn ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-right">
                    ${totalPayout.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {creators.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-6 text-center text-gray-400"
                >
                  No creators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
