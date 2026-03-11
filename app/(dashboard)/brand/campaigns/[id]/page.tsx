import { notFound } from "next/navigation";
import { getCampaignWithApplications } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function BrandCampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignWithApplications(id);

  if (!campaign) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <StatusBadge status={campaign.status} />
      </div>
      <h1 className="text-2xl font-bold mb-1">{campaign.title}</h1>
      <p className="text-gray-500 mb-6">{campaign.businessName}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Payout</p>
          <p className="text-2xl font-bold">${campaign.payout}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="text-lg font-bold">
            {new Date(campaign.deadline).toLocaleDateString()}
          </p>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="font-bold mb-2">Brief</h2>
        <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
      </div>

      <div>
        <h2 className="font-bold mb-3">
          Applications ({campaign.applications.length})
        </h2>
        {campaign.applications.length === 0 ? (
          <p className="text-gray-500 text-sm">No one's applied yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {campaign.applications.map((app) => (
              <Card key={app.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">@{app.creatorHandle}</p>
                    <p className="text-xs text-gray-400 capitalize">{app.creatorTier} tier</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
