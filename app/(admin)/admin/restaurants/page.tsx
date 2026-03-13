import { db } from '@/lib/db';
import {
  brands,
  briefings,
  assignments,
  posts,
  cascadeEvents,
  campaignSequences,
} from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function RestaurantsPage() {
  // All brands with aggregated stats
  const brandRows = await db
    .select({
      brandId: brands.id,
      businessName: brands.businessName,
      activeBriefings:
        sql<number>`count(distinct case when ${briefings.status} = 'active' then ${briefings.id} end)::int`,
      totalPosts: sql<number>`count(distinct ${posts.id})::int`,
      totalHiDelivered:
        sql<string>`coalesce(sum(distinct ${briefings.hiDelivered}), 0)`,
    })
    .from(brands)
    .leftJoin(briefings, eq(briefings.brandId, brands.id))
    .leftJoin(assignments, eq(assignments.briefingId, briefings.id))
    .leftJoin(posts, eq(posts.assignmentId, assignments.id))
    .groupBy(brands.id, brands.businessName)
    .orderBy(brands.businessName);

  // Cascade counts per brand
  const cascadeCounts = await db
    .select({
      brandId: cascadeEvents.brandId,
      count: sql<number>`count(*)::int`,
    })
    .from(cascadeEvents)
    .groupBy(cascadeEvents.brandId);

  const cascadeMap = new Map(
    cascadeCounts.map((c) => [c.brandId, c.count])
  );

  // Budget trend per brand: latest campaignSequence budgetIncreased value
  const latestSequences = await db
    .select({
      brandId: campaignSequences.brandId,
      budgetIncreased: campaignSequences.budgetIncreased,
      sequenceNumber: campaignSequences.sequenceNumber,
    })
    .from(campaignSequences)
    .orderBy(desc(campaignSequences.sequenceNumber));

  // Build a map of brand -> latest budget trend
  const budgetTrendMap = new Map<string, boolean | null>();
  for (const seq of latestSequences) {
    if (!budgetTrendMap.has(seq.brandId)) {
      if (seq.sequenceNumber >= 2) {
        budgetTrendMap.set(seq.brandId, seq.budgetIncreased);
      } else {
        budgetTrendMap.set(seq.brandId, null);
      }
    }
  }

  function trendIndicator(brandId: string): string {
    const trend = budgetTrendMap.get(brandId);
    if (trend === true) return 'Up';
    if (trend === false) return 'Down';
    return 'Flat';
  }

  function trendColor(brandId: string): string {
    const trend = budgetTrendMap.get(brandId);
    if (trend === true) return 'text-green-600';
    if (trend === false) return 'text-red-500';
    return 'text-gray-400';
  }

  function trendArrow(brandId: string): string {
    const trend = budgetTrendMap.get(brandId);
    if (trend === true) return '\u2191';
    if (trend === false) return '\u2193';
    return '-';
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Restaurants</h2>
        <p className="text-sm text-gray-500 mt-1">
          All restaurants in the pilot with key performance metrics.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Restaurant</th>
              <th className="px-6 py-3 font-medium text-right">
                Active Briefings
              </th>
              <th className="px-6 py-3 font-medium text-right">Posts</th>
              <th className="px-6 py-3 font-medium text-right">Cascades</th>
              <th className="px-6 py-3 font-medium text-right">
                HI Delivered
              </th>
              <th className="px-6 py-3 font-medium text-center">
                Budget Trend
              </th>
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
                  {row.activeBriefings}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {row.totalPosts}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {cascadeMap.get(row.brandId) ?? 0}
                </td>
                <td className="px-6 py-3 text-gray-600 text-right">
                  {parseFloat(row.totalHiDelivered).toFixed(1)}
                </td>
                <td
                  className={`px-6 py-3 text-center font-semibold ${trendColor(row.brandId)}`}
                >
                  <span title={trendIndicator(row.brandId)}>
                    {trendArrow(row.brandId)}
                  </span>
                </td>
              </tr>
            ))}
            {brandRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-6 text-center text-gray-400"
                >
                  No restaurants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
