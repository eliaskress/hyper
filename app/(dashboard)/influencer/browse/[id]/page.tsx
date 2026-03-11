import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
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
      <Link
        href="/influencer/browse"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors mb-4"
      >
        &larr; Back to campaigns
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={campaign.status} />
          {campaign.verified && (
            <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">{campaign.title}</h1>
        <p className="text-gray-500 font-medium">{campaign.businessName}</p>
        {campaign.address && (
          <p className="text-sm text-gray-400 mt-0.5">{campaign.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Payout" value={`$${campaign.payout}`} accent />
        <StatCard
          label="Deadline"
          value={new Date(campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        />
      </div>

      <Card className="mb-8">
        <h2 className="font-bold mb-3">Campaign Brief</h2>
        <p className="text-gray-600 leading-relaxed">{campaign.description}</p>
      </Card>

      <button className="w-full rounded-2xl bg-black text-white py-4 font-semibold text-base hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10 min-h-[52px]">
        Apply to Campaign
      </button>
    </div>
  );
}
