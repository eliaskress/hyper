export const dynamic = "force-dynamic";

import { getCreatorApplications } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerApplications() {
  const applications = await getCreatorApplications(DEMO_CREATOR_ID);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Applications</h1>
        <p className="text-gray-400 text-sm">
          {applications.length} {applications.length === 1 ? "application" : "applications"} submitted
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-medium text-gray-900 mb-1">No applications yet</p>
          <p className="text-sm text-gray-400">Browse campaigns and find your first one.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{app.campaignTitle}</p>
                  <p className="text-sm text-gray-500">{app.businessName}</p>
                  {app.address && (
                    <p className="text-xs text-gray-400 mt-0.5">{app.address}</p>
                  )}
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="text-sm font-bold">${app.campaignPayout}</span>
                <span className="text-xs text-gray-400">
                  Applied {new Date(app.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
