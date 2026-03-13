import { getBrandByUserId, getBrandBriefing, getBriefingInfluenceSpread, getBriefingCreatorRanking } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function CampaignsPage() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  const briefing = await getBrandBriefing(brand.id);
  if (!briefing) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">No active campaign yet.</p>
        </div>
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">Create a briefing to start your first campaign.</p>
        </Card>
      </div>
    );
  }

  const spread = await getBriefingInfluenceSpread(briefing.id);
  const creators = await getBriefingCreatorRanking(briefing.id);

  const totalHi = creators.reduce((sum, c) => sum + c.totalHi, 0);
  const totalReach = creators.reduce((sum, c) => sum + c.totalReach, 0);
  const totalAmps = creators.reduce((sum, c) => sum + c.amplificationsReceived, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Creator impact ranking for your campaign
        </p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total HI" value={totalHi.toFixed(1)} accent />
        <StatCard label="Reach" value={totalReach.toLocaleString()} />
        <StatCard label="Creators" value={spread.creatorsPosted} />
        <StatCard label="Amplifications" value={totalAmps} />
      </div>

      {/* Creator Impact Ranking */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Creator Impact Ranking</h2>
        {creators.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">No measured posts yet. Rankings will appear once creators post and metrics are captured.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {creators.map((creator, i) => (
              <Card key={creator.handle} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-gray-300 w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                    {creator.avatar ?? creator.handle.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">@{creator.handle}</p>
                      <Link
                        href={
                          creator.primaryPlatform === "tiktok"
                            ? `https://tiktok.com/@${creator.handle}`
                            : `https://instagram.com/${creator.handle}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        {creator.primaryPlatform === "tiktok" ? (
                          <TikTokIcon className="w-4 h-4 text-gray-400 hover:text-black transition-colors" />
                        ) : (
                          <InstagramIcon className="w-4 h-4 text-gray-400 hover:text-pink-500 transition-colors" />
                        )}
                      </Link>
                      {creator.neighborhood && (
                        <span className="text-[10px] text-gray-400 shrink-0">{creator.neighborhood}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">{creator.followersCount?.toLocaleString()} followers</span>
                      <span className="text-xs text-gray-400">HIG {creator.higScore}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{creator.totalHi.toFixed(1)} HI</p>
                    <p className="text-[10px] text-gray-400">
                      {creator.postCount} post{creator.postCount !== 1 ? "s" : ""}
                      {creator.amplificationsReceived > 0 && `, ${creator.amplificationsReceived} amp${creator.amplificationsReceived !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
    </svg>
  );
}
