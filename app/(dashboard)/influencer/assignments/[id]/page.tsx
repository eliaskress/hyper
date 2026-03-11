export const dynamic = "force-dynamic";

import { getAssignmentDetail } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import { PRICE_PER_HI, REVENUE_SPLIT } from "@/lib/hi";
import { notFound } from "next/navigation";
import { AssignmentActions } from "./assignment-actions";

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

      {/* Post & Metrics (if posted) */}
      {a.postUrl && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Your Post</h2>
          <a
            href={a.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
            </svg>
            {a.postUrl.replace(/https?:\/\//, "").slice(0, 40)}...
          </a>

          {a.hiCalculated ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-lg font-bold">{parseFloat(a.hiCalculated).toFixed(1)} HI</span>
                <span className="text-sm font-semibold text-emerald-600">
                  ${(parseFloat(a.hiCalculated) * PRICE_PER_HI * REVENUE_SPLIT.creator / 100).toFixed(2)} earned
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                <div>
                  <p className="text-gray-500">Likes</p>
                  <p className="font-medium">{a.likes?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cmts</p>
                  <p className="font-medium">{a.comments?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Saves</p>
                  <p className="font-medium">{a.saves?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Shares</p>
                  <p className="font-medium">{a.shares?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reach</p>
                  <p className="font-medium">{a.reach?.toLocaleString() ?? "—"}</p>
                </div>
              </div>
              {a.measuredAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Measured {new Date(a.measuredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
              Awaiting measurement — metrics will be captured 7 days after posting
            </div>
          )}
        </Card>
      )}

      {/* Decline reason (if declined) */}
      {a.status === "declined" && a.declineReason && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Decline Reason</h2>
          <p className="text-sm text-gray-600">{a.declineReason}</p>
        </Card>
      )}

      {/* Earnings summary (if measured or paid) */}
      {a.hiCalculated && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Earnings</h2>
          <HiEarnings hi={a.hiCalculated} className="text-lg" />
          <p className="text-xs text-gray-500 mt-1">
            {parseFloat(a.hiCalculated).toFixed(1)} HI &times; ${PRICE_PER_HI}/HI &times; {REVENUE_SPLIT.creator}% creator share
          </p>
        </Card>
      )}

      {/* Actions */}
      <AssignmentActions
        assignmentId={a.id}
        status={a.status}
        hasPost={!!a.postUrl}
        hasSchedule={!!a.scheduledDate}
        availabilityDays={days}
        availabilityMeals={meals}
      />
    </div>
  );
}
