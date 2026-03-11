import { getCreatorStats, getCreatorApplications } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerHome() {
  const stats = await getCreatorStats(DEMO_CREATOR_ID);
  const applications = await getCreatorApplications(DEMO_CREATOR_ID);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome back, Maria</h1>
      <p className="text-gray-500 text-sm mb-6">Here's your Hyper overview.</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold">{stats.acceptedCampaigns}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">{stats.completedCampaigns}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-2xl font-bold">${stats.totalEarned}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Badges</p>
          <p className="text-2xl font-bold">{stats.badges.length}</p>
        </Card>
      </div>

      <h2 className="text-lg font-bold mb-3">Your Applications</h2>
      {applications.length === 0 ? (
        <p className="text-gray-500 text-sm">No applications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{app.campaignTitle}</p>
                  <p className="text-sm text-gray-500">{app.businessName}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm font-medium mt-2">${app.campaignPayout}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
