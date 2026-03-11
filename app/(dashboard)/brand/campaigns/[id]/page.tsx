export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignWithApplications } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApplicationActions } from "./application-actions";

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
      <Link
        href="/brand/campaigns"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors mb-4"
      >
        &larr; Back to campaigns
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={campaign.status} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">{campaign.title}</h1>
        <p className="text-gray-500">{campaign.businessName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Payout" value={`$${campaign.payout}`} accent />
        <StatCard
          label="Deadline"
          value={new Date(campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        />
      </div>

      <Card className="mb-8">
        <h2 className="font-bold mb-3">Brief</h2>
        <p className="text-gray-600 leading-relaxed">{campaign.description}</p>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Applications</h2>
        <span className="text-xs text-gray-400 font-medium">
          {campaign.applications.length} {campaign.applications.length === 1 ? "applicant" : "applicants"}
        </span>
      </div>

      {campaign.applications.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No applications yet</p>
          <p className="text-sm text-gray-400">Share your campaign to attract creators.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {campaign.applications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start mb-3">
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
                    <p className="text-xs text-gray-400 capitalize">{app.creatorTier} tier</p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex gap-4 mb-3 text-sm">
                {app.creatorFollowers && (
                  <div>
                    <span className="text-gray-400 text-xs">Followers</span>
                    <p className="font-semibold">{app.creatorFollowers.toLocaleString()}</p>
                  </div>
                )}
                {app.creatorLocation && (
                  <div>
                    <span className="text-gray-400 text-xs">Location</span>
                    <p className="font-semibold">{app.creatorLocation}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-xs">Instagram</span>
                  <p>
                    <a
                      href={`https://instagram.com/${app.creatorHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      View
                    </a>
                  </p>
                </div>
              </div>

              {app.status === "applied" && (
                <ApplicationActions applicationId={app.id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
