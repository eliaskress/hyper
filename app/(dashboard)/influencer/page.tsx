export const dynamic = "force-dynamic";

import { getCreatorStats, getCreatorApplications } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerHome() {
  const stats = await getCreatorStats(DEMO_CREATOR_ID);
  const applications = await getCreatorApplications(DEMO_CREATOR_ID);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-400 mb-1">Welcome back</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Maria</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <StatCard label="Active" value={stats.acceptedCampaigns} />
        <StatCard label="Completed" value={stats.completedCampaigns} />
        <StatCard label="Earned" value={`$${stats.totalEarned}`} accent />
        <StatCard label="Badges" value={stats.badges.length} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Recent Applications</h2>
        <span className="text-xs text-gray-400 font-medium">{applications.length} total</span>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No applications yet</p>
          <p className="text-sm text-gray-400">Browse campaigns to find your first gig.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{app.campaignTitle}</p>
                  <p className="text-sm text-gray-500">{app.businessName}</p>
                  {app.address && (
                    <p className="text-xs text-gray-400 mt-0.5">{app.address}</p>
                  )}
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm font-bold">${app.campaignPayout}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
