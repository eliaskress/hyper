import Link from "next/link";
import { getActiveCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";

export default async function BrowseCampaigns() {
  const campaigns = await getActiveCampaigns();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Browse</h1>
        <p className="text-gray-400 text-sm">
          {campaigns.length} active {campaigns.length === 1 ? "campaign" : "campaigns"}
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-medium text-gray-900 mb-1">Nothing here yet</p>
          <p className="text-sm text-gray-400">Check back soon — restaurants post daily.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/influencer/browse/${campaign.id}`}>
              <Card className="hover:shadow-md hover:border-gray-200 transition-all duration-200 active:scale-[0.99]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{campaign.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {campaign.businessName}
                      {campaign.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1" className="flex-shrink-0">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </p>
                    {campaign.address && (
                      <p className="text-xs text-gray-400 mt-0.5">{campaign.address}</p>
                    )}
                  </div>
                  <span className="text-lg font-extrabold whitespace-nowrap ml-3">${campaign.payout}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                  {campaign.description}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-xs font-medium text-gray-400">
                    Due {new Date(campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs font-semibold text-black">View &rarr;</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
