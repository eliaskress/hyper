import { getCreatorApplications } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerApplications() {
  const applications = await getCreatorApplications(DEMO_CREATOR_ID);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Your Applications</h1>
      <p className="text-gray-500 text-sm mb-6">
        Track the status of campaigns you've applied to.
      </p>

      {applications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium">No applications yet.</p>
          <p className="text-gray-500 text-sm">Browse campaigns and find your first one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{app.campaignTitle}</p>
                  <p className="text-sm text-gray-500">{app.businessName}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">${app.campaignPayout}</span>
                <span className="text-xs text-gray-400">
                  Applied {new Date(app.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
