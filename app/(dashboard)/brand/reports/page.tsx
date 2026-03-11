import { getBrandByUserId, getBrandBriefing, getBriefingReports, getBrandStats } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

import { WhatsAppPreview } from "@/components/ui/whatsapp-preview";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function ReportsPage() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  const briefing = await getBrandBriefing(brand.id);
  const stats = await getBrandStats(brand.id);

  if (!briefing) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">No data yet. Create a briefing to start measuring influence.</p>
        </Card>
      </div>
    );
  }

  const reports = await getBriefingReports(briefing.id);
  const measuredPosts = reports.filter((r) => r.hiCalculated);
  const totalHi = measuredPosts.reduce((sum, r) => sum + parseFloat(r.hiCalculated ?? "0"), 0);
  const roi = stats.creatorsMatched > 0 ? (totalHi / stats.creatorsMatched).toFixed(1) : "0";

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Campaign performance and HI results</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total HI" value={totalHi.toFixed(1)} accent />
        <StatCard label="Posts Measured" value={measuredPosts.length} />
        <StatCard label="HI per Creator" value={roi} />
        <StatCard label="Creators" value={stats.creatorsMatched} />
      </div>

      {/* Post Results */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Post Results</h2>
        <div className="space-y-3">
          {reports.map((post) => (
            <Card key={post.postId} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                    {post.creatorHandle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">@{post.creatorHandle}</p>
                    <p className="text-xs text-gray-500 capitalize">{post.platform}</p>
                  </div>
                </div>
                <StatusBadge status={post.assignmentStatus} />
              </div>

              {post.hiCalculated ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="mb-2">
                      <span className="text-lg font-bold">{parseFloat(post.hiCalculated).toFixed(1)} HI</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      <div>
                        <p className="text-gray-500">Likes</p>
                        <p className="font-medium">{post.likes?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cmts</p>
                        <p className="font-medium">{post.comments?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Saves</p>
                        <p className="font-medium">{post.saves?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Shares</p>
                        <p className="font-medium">{post.shares?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reach</p>
                        <p className="font-medium">{post.reach?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  {post.measuredAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Measured {new Date(post.measuredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 rounded-lg p-3 mt-2 text-sm text-amber-700">
                  Awaiting measurement — metrics will be captured 7 days after posting
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {reports.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">No posts yet. Once creators post content, results will appear here.</p>
        </Card>
      )}

      {/* WhatsApp Report Preview */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Reports delivered via WhatsApp</h2>
        <WhatsAppPreview
          messages={[
            {
              from: "hyper",
              text: `${brand.businessName} — Weekly Report\n\nCreators active: ${stats.creatorsMatched}\nHI delivered: ${totalHi.toFixed(1)}\nHI per creator: ${roi}\n\nYour campaign is running.`,
              time: "9:00 AM",
            },
          ]}
        />
      </Card>
    </div>
  );
}
