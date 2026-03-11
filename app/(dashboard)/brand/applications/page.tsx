export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCampaignWithApplications, getBrandCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandApplications() {
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  const allApps = [];
  for (const campaign of campaigns) {
    const detail = await getCampaignWithApplications(campaign.id);
    if (detail) {
      for (const app of detail.applications) {
        allApps.push({ ...app, campaignTitle: detail.title, campaignId: detail.id });
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Applications</h1>
        <p className="text-gray-400 text-sm">
          {allApps.length} {allApps.length === 1 ? "application" : "applications"} received
        </p>
      </div>

      {allApps.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-medium text-gray-900 mb-1">No applications yet</p>
          <p className="text-sm text-gray-400">Share your campaigns to get more eyes on them.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allApps.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                    {app.creatorHandle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/brand/applicant/${app.influencerId}`}
                      className="font-semibold hover:underline"
                    >
                      @{app.creatorHandle}
                    </Link>
                    <p className="text-sm text-gray-500">{app.campaignTitle}</p>
                    <p className="text-xs text-gray-400 capitalize">{app.creatorTier} tier</p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex gap-4 text-sm pt-2 border-t border-gray-50">
                {app.creatorFollowers && (
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-900">{app.creatorFollowers.toLocaleString()}</span> followers
                  </span>
                )}
                {app.creatorLocation && (
                  <span className="text-gray-400">{app.creatorLocation}</span>
                )}
              </div>

              {app.status === "applied" && (
                <div className="mt-3">
                  <Link
                    href={`/brand/campaigns/${app.campaignId}`}
                    className="text-sm text-indigo-600 font-semibold hover:underline"
                  >
                    Review &rarr;
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
