import { getCampaignWithApplications, getBrandCampaigns } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000100";

export default async function BrandApplications() {
  const campaigns = await getBrandCampaigns(DEMO_BRAND_ID);

  // Gather all applications across all campaigns
  const allApps = [];
  for (const campaign of campaigns) {
    const detail = await getCampaignWithApplications(campaign.id);
    if (detail) {
      for (const app of detail.applications) {
        allApps.push({ ...app, campaignTitle: detail.title });
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Applications</h1>
      <p className="text-gray-500 text-sm mb-6">
        Review applications from creators.
      </p>

      {allApps.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium">No applications yet.</p>
          <p className="text-gray-500 text-sm">Share your campaigns to get more eyes on them.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allApps.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">@{app.creatorHandle}</p>
                  <p className="text-sm text-gray-500">{app.campaignTitle}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-xs text-gray-400 mt-1 capitalize">{app.creatorTier} tier</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
