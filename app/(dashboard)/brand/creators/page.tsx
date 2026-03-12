import { getBrandByUserId, getBrandBriefing, getBriefingCreators } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiDisplay } from "@/components/ui/hi-display";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function CreatorsPage() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  const briefing = await getBrandBriefing(brand.id);
  if (!briefing) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">Create a briefing first. Hyper will match creators automatically.</p>
        </Card>
      </div>
    );
  }

  const creators = await getBriefingCreators(briefing.id);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {creators.length} creator{creators.length !== 1 ? "s" : ""} matched to your restaurant
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
        Hyper selects creators based on HIG score, location, and platform fit.
        <br />
        You don&apos;t need to review or approve — we handle everything.
      </div>

      {/* Creator cards */}
      <div className="space-y-3">
        {creators.map((creator) => (
          <Card key={creator.assignmentId} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                  {creator.handle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">@{creator.handle}</p>
                  <p className="text-xs text-gray-500">{creator.location}</p>
                </div>
              </div>
              <StatusBadge status={creator.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-xs text-gray-500">Followers</p>
                <p className="text-sm font-semibold">
                  {creator.followersCount
                    ? (creator.followersCount / 1000).toFixed(1) + "K"
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-xs text-gray-500">HIG Score</p>
                <p className="text-sm font-semibold">{creator.higScore}/100</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-xs text-gray-500">Tier</p>
                <p className="text-sm font-semibold capitalize">{creator.tier}</p>
              </div>
            </div>

            {creator.allocatedHi && ["measured", "paid"].includes(creator.status) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <HiDisplay hi={creator.allocatedHi} size="sm" />
              </div>
            )}

            {creator.postUrl && (
              <a
                href={creator.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
                View post
              </a>
            )}

            {creator.scheduledDate && (
              <div className="mt-2 text-xs text-gray-500">
                {creator.status === "scheduled" ? "Visit scheduled: " : "Visited: "}
                {new Date(creator.scheduledDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {creator.scheduleTimeStart && ` at ${creator.scheduleTimeStart}`}
                {creator.scheduleType === "flexible" && creator.scheduleTimeEnd && `–${creator.scheduleTimeEnd}`}
              </div>
            )}
          </Card>
        ))}
      </div>

      {creators.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">
            Hyper is finding the best creators for your restaurant. Check back soon.
          </p>
        </Card>
      )}
    </div>
  );
}
