export const dynamic = "force-dynamic";

import { getCreatorStats, getCreatorEarnings } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import { PRICE_PER_HI, REVENUE_SPLIT } from "@/lib/hi";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerEarnings() {
  const stats = await getCreatorStats(DEMO_CREATOR_ID);
  const earnings = await getCreatorEarnings(DEMO_CREATOR_ID);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Earnings</h1>
        <p className="text-gray-400 text-sm">Your HI-based payout history.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Earned" value={`$${stats.totalEarned}`} accent />
        <StatCard label="Total HI" value={parseFloat(stats.totalHi).toFixed(1)} />
      </div>

      {/* Pricing info */}
      <div className="bg-gray-50 rounded-xl p-3 mb-6 text-center">
        <p className="text-xs text-gray-500">
          ${PRICE_PER_HI}/HI &times; {REVENUE_SPLIT.creator}% creator share = <span className="font-semibold text-gray-700">${(PRICE_PER_HI * REVENUE_SPLIT.creator / 100).toFixed(0)}/HI</span> in your pocket
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Payout History</h2>
        <span className="text-xs text-gray-400 font-medium">{earnings.length} payouts</span>
      </div>

      {earnings.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No payouts yet</p>
          <p className="text-sm text-gray-400">Complete assignments to start earning based on your HI.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {earnings.map((e) => (
            <Card key={e.payoutId}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{e.businessName}</p>
                  {e.address && (
                    <p className="text-xs text-gray-400 mt-0.5">{e.address}</p>
                  )}
                </div>
                <span className={`font-extrabold text-lg ml-3 ${
                  e.status === "paid" ? "text-emerald-600" :
                  e.status === "cancelled" ? "text-red-400 line-through" :
                  "text-gray-900"
                }`}>
                  ${e.amount}
                </span>
              </div>
              {e.hiAmount && (
                <p className="text-xs text-gray-500 mb-1">
                  {parseFloat(e.hiAmount).toFixed(1)} HI &times; ${(PRICE_PER_HI * REVENUE_SPLIT.creator / 100).toFixed(0)}/HI
                </p>
              )}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                <StatusBadge status={e.status} />
                <span className="text-xs text-gray-400">
                  {e.status === "paid" && e.paidAt
                    ? new Date(e.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : e.status === "pending"
                    ? "Processing"
                    : ""}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
