export const dynamic = "force-dynamic";

import { getAssignmentDetail } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import { PRICE_PER_HI, REVENUE_SPLIT } from "@/lib/hi";
import { notFound } from "next/navigation";
import { AssignmentActions } from "./assignment-actions";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAssignmentDetail(id);
  if (!a) return notFound();

  const days = (a.availabilityDays as string[]) ?? [];
  const meals = (a.availabilityMeals as string[]) ?? [];
  const selectedPlatforms = a.selectedPlatforms ?? [];
  const submittedPlatforms = a.posts.map((p) => p.platform);
  const totalHi = a.posts.reduce((sum, p) => sum + parseFloat(p.hiCalculated ?? "0"), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{a.businessName}</h1>
          <StatusBadge status={a.status} />
        </div>
        {a.address && <p className="text-sm text-gray-500">{a.address}</p>}
        {a.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Verified
          </span>
        )}
      </div>

      {/* Content Brief */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Content Brief</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{a.contentBrief}</p>
      </Card>

      {/* What's Included */}
      {a.offerDescription && (
        <Card className="mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                <path d="M2 8h20v4H2z" />
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">What&apos;s Included</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{a.offerDescription}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Platforms */}
      {selectedPlatforms.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Posting on</h2>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((p) => (
              <span key={p} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full capitalize">
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Availability */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Restaurant Availability</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Days</p>
            <div className="flex flex-wrap gap-1.5">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                (day) => (
                  <span
                    key={day}
                    className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                      days.includes(day)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </span>
                )
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Meal times</p>
            <div className="flex flex-wrap gap-1.5">
              {["breakfast", "lunch", "dinner"].map((meal) => (
                <span
                  key={meal}
                  className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                    meals.includes(meal)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {meal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule (if set) */}
      {a.scheduledDate && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Your Visit</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">
                {new Date(a.scheduledDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                {a.scheduleTimeStart}
                {a.scheduleType === "flexible" && a.scheduleTimeEnd && `\u2013${a.scheduleTimeEnd}`}
                {" "}
                ({a.scheduleType === "flexible" ? "Flexible" : "Fixed"})
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Posts & Metrics */}
      {a.posts.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Your Post{a.posts.length > 1 ? "s" : ""}
          </h2>
          <div className="space-y-3">
            {a.posts.map((post) => (
              <div key={post.id} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-700 capitalize">
                    {PLATFORM_LABELS[post.platform] ?? post.platform}
                  </span>
                  {post.postUrl && (
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <path d="M15 3h6v6" />
                        <path d="M10 14L21 3" />
                      </svg>
                      View
                    </a>
                  )}
                </div>

                {post.hiCalculated ? (
                  <>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-lg font-bold">{parseFloat(post.hiCalculated).toFixed(1)} HI</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        ${(parseFloat(post.hiCalculated) * PRICE_PER_HI * REVENUE_SPLIT.creator / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      <div><p className="text-gray-500">Likes</p><p className="font-medium">{post.likes?.toLocaleString() ?? "—"}</p></div>
                      <div><p className="text-gray-500">Cmts</p><p className="font-medium">{post.comments?.toLocaleString() ?? "—"}</p></div>
                      <div><p className="text-gray-500">Saves</p><p className="font-medium">{post.saves?.toLocaleString() ?? "—"}</p></div>
                      <div><p className="text-gray-500">Shares</p><p className="font-medium">{post.shares?.toLocaleString() ?? "—"}</p></div>
                      <div><p className="text-gray-500">Reach</p><p className="font-medium">{post.reach?.toLocaleString() ?? "—"}</p></div>
                    </div>
                    {post.measuredAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Measured {new Date(post.measuredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-700">
                    Awaiting measurement — metrics captured 7 days after posting
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Decline reason */}
      {a.status === "declined" && a.declineReason && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Decline Reason</h2>
          <p className="text-sm text-gray-600">{a.declineReason}</p>
        </Card>
      )}

      {/* Total Earnings (if any measured posts) */}
      {totalHi > 0 && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Total Earnings{a.posts.length > 1 ? ` (${a.posts.filter(p => p.hiCalculated).length} posts)` : ""}
          </h2>
          <HiEarnings hi={totalHi} className="text-lg" />
          <p className="text-xs text-gray-500 mt-1">
            {totalHi.toFixed(1)} HI &times; ${PRICE_PER_HI}/HI &times; {REVENUE_SPLIT.creator}% creator share
          </p>
        </Card>
      )}

      {/* Actions */}
      <AssignmentActions
        assignmentId={a.id}
        status={a.status}
        selectedPlatforms={selectedPlatforms}
        submittedPlatforms={submittedPlatforms}
        hasSchedule={!!a.scheduledDate}
        availabilityDays={days}
        availabilityMeals={meals}
      />
    </div>
  );
}
