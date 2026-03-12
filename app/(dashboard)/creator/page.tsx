export const dynamic = "force-dynamic";

import { getCreatorStats, getCreatorAssignments } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import Link from "next/link";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerHome() {
  const stats = await getCreatorStats(DEMO_CREATOR_ID);
  const assignments = await getCreatorAssignments(DEMO_CREATOR_ID);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-400 mb-1">Welcome back</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Maria</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <StatCard label="Collabs" value={stats.totalAssignments} />
        <StatCard label="Completed" value={stats.completedAssignments} />
        <StatCard label="Earned" value={`$${stats.totalEarned}`} accent />
        <StatCard label="Total HI" value={parseFloat(stats.totalHi).toFixed(1)} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Collabs</h2>
        <Link href="/creator/assignments" className="text-xs text-gray-400 font-medium hover:text-gray-600">
          View all &rarr;
        </Link>
      </div>

      {assignments.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No collabs yet</p>
          <p className="text-sm text-gray-400">Hyper will match you with restaurants based on your HIG score.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map((a) => (
            <Link key={a.id} href={`/creator/assignments/${a.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.businessName}</p>
                    {a.address && (
                      <p className="text-xs text-gray-400 mt-0.5">{a.address}</p>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">{a.contentBrief}</p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  {a.hiCalculated ? (
                    <HiEarnings hi={a.hiCalculated} className="text-sm" />
                  ) : a.status === "invited" ? (
                    <span className="text-xs text-blue-600 font-medium">Tap to respond</span>
                  ) : a.status === "scheduled" && a.scheduledDate ? (
                    <span className="text-xs text-gray-500">
                      Visit {new Date(a.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  ) : a.status === "posted" ? (
                    <span className="text-xs text-amber-600 font-medium">Awaiting measurement</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-gray-400 text-sm">&rarr;</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* WhatsApp note */}
      <div className="bg-gray-50 rounded-xl p-4 text-center mt-6">
        <p className="text-xs text-gray-500">
          Collab invitations and updates are sent via WhatsApp.
          <br />
          Hyper matches you based on your HIG score and location.
        </p>
      </div>
    </div>
  );
}
