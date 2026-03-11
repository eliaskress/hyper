import { getBrandStats, getBrandCampaigns } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandHome() {
  const stats = await getBrandStats(DEMO_BRAND_ID);
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-400 mb-1">Dashboard</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Bacio di Latte</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <StatCard label="Active" value={stats.activeCampaigns} />
        <StatCard label="Completed" value={stats.completedCampaigns} />
        <StatCard label="Applications" value={stats.totalApplications} />
        <StatCard label="Total Paid" value={`$${stats.totalPaidOut.toFixed(2)}`} accent />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Campaigns</h2>
        <span className="text-xs text-gray-400 font-medium">{campaigns.length} total</span>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No campaigns yet</p>
          <p className="text-sm text-gray-400">Create your first one to start finding creators.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">{campaign.title}</p>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="text-sm font-bold">${campaign.payout}</span>
                <span className="text-xs text-gray-400">
                  Due {new Date(campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
