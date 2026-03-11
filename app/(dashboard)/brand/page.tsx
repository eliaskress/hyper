import { getBrandStats, getBrandCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandHome() {
  const stats = await getBrandStats(DEMO_BRAND_ID);
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bacio di Latte</h1>
      <p className="text-gray-500 text-sm mb-6">Here's what's happening with your campaigns.</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Active Campaigns</p>
          <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">{stats.completedCampaigns}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Applications</p>
          <p className="text-2xl font-bold">{stats.totalApplications}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Paid Out</p>
          <p className="text-2xl font-bold">${stats.totalPaidOut.toFixed(2)}</p>
        </Card>
      </div>

      <h2 className="text-lg font-bold mb-3">Your Campaigns</h2>
      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-sm">No campaigns yet. Create your first one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <div className="flex justify-between items-start">
                <p className="font-medium">{campaign.title}</p>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">${campaign.payout}</span>
                <span className="text-xs text-gray-400">
                  Due {new Date(campaign.deadline).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
