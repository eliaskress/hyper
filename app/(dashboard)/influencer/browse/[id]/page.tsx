import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={campaign.status} />
          {campaign.verified && (
            <span className="text-xs text-green-600 font-medium">Verified</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{campaign.title}</h1>
        <p className="text-gray-500">{campaign.businessName}</p>
      </div>

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

      <button className="w-full rounded-lg bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors min-h-[44px]">
        Apply to Campaign
      </button>
    </div>
  );
}
