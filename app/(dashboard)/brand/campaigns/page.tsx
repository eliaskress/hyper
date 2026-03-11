import Link from "next/link";
import { getBrandCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandCampaigns() {
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Campaigns</h1>
          <p className="text-gray-500 text-sm">{campaigns.length} total</p>
        </div>
        <Link
          href="/dashboard/brand/campaigns/new"
          className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + New
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium">No campaigns yet.</p>
          <p className="text-gray-500 text-sm">Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/dashboard/brand/campaigns/${campaign.id}`}>
              <Card className="hover:border-black transition-colors">
                <div className="flex justify-between items-start">
                  <p className="font-bold">{campaign.title}</p>
                  <StatusBadge status={campaign.status} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">${campaign.payout}</span>
                  <span className="text-xs text-gray-400">
                    Due {new Date(campaign.deadline).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
