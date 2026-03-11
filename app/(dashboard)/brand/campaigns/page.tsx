export const dynamic = "force-dynamic";

import Link from "next/link";
import { getBrandCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandCampaigns() {
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Campaigns</h1>
          <p className="text-gray-400 text-sm">{campaigns.length} total</p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all shadow-sm"
        >
          + New
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-medium text-gray-900 mb-1">No campaigns yet</p>
          <p className="text-sm text-gray-400">Create your first campaign to get started.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
              <Card className="hover:shadow-md hover:border-gray-200 transition-all duration-200 active:scale-[0.99]">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold">{campaign.title}</p>
                  <StatusBadge status={campaign.status} />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-sm font-bold">${campaign.payout}</span>
                  <span className="text-xs text-gray-400">
                    Due {new Date(campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
