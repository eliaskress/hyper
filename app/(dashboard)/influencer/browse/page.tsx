import Link from "next/link";
import { getActiveCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function BrowseCampaigns() {
  const campaigns = await getActiveCampaigns();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Browse Campaigns</h1>
      <p className="text-gray-500 text-sm mb-6">Find your next paid opportunity.</p>

      {campaigns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium">Nothing here yet.</p>
          <p className="text-gray-500 text-sm">Check back soon — restaurants post daily.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/dashboard/influencer/browse/${campaign.id}`}>
              <Card className="hover:border-black transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{campaign.title}</p>
                    <p className="text-sm text-gray-500">
                      {campaign.businessName}
                      {campaign.verified && " ✓"}
                    </p>
                  </div>
                  <span className="text-lg font-bold">${campaign.payout}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {campaign.description}
                </p>
                <div className="flex justify-between items-center">
                  <StatusBadge status={campaign.status} />
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
