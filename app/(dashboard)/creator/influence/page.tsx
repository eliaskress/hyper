export const dynamic = "force-dynamic";

import {
  getCreatorStats,
  getCreatorProfile,
  getAmplifiersForCreator,
  getAmplificationOpportunities,
  getCreatorReach,
  getCreatorAvgHi,
  getNetworkHi,
  getNetworkEarnings,
  getReferralsByReferrer,
  getCreatorCityRank,
  getNeighborhoodHi,
} from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { HiTooltip } from "@/components/ui/hi-tooltip";
import { QrCode } from "@/components/ui/qr-code";
import { ReferralActions } from "@/components/ui/referral-actions";
import { AmplifyButton } from "./amplify-button";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default async function InfluencePage() {
  const [stats, profile, amplifiers, ampOpportunities, reach, avgHi, networkHi, networkEarnings, referrals, cityRank] = await Promise.all([
    getCreatorStats(DEMO_CREATOR_ID),
    getCreatorProfile(DEMO_CREATOR_ID),
    getAmplifiersForCreator(DEMO_CREATOR_ID),
    getAmplificationOpportunities(DEMO_CREATOR_ID),
    getCreatorReach(DEMO_CREATOR_ID),
    getCreatorAvgHi(DEMO_CREATOR_ID),
    getNetworkHi(DEMO_CREATOR_ID),
    getNetworkEarnings(DEMO_CREATOR_ID),
    getReferralsByReferrer(DEMO_CREATOR_ID),
    getCreatorCityRank(DEMO_CREATOR_ID),
  ]);

  const referralCode = profile?.referralCode ?? "HYPER";
  const referralLink = `https://hyper.la/join/${referralCode}`;
  const neighborhood = profile?.neighborhood;

  // Fetch neighborhood HI if creator has a neighborhood
  let neighborhoodHi = 0;
  if (neighborhood) {
    neighborhoodHi = await getNeighborhoodHi(neighborhood);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Influence</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your impact, grow your network.
        </p>
      </div>

      {/* Section 1: Your Influence */}
      <div className="rounded-2xl bg-[#2563eb] text-white p-6 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Your Influence</p>
          <HiTooltip />
        </div>
        <p className="text-4xl font-extrabold tracking-tight">
          {parseFloat(stats.totalHi).toFixed(1)} <span className="text-lg font-semibold text-white/50">HI</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Reach</p>
          <p className="text-xl font-bold tracking-tight">{formatReach(reach)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Campaigns</p>
          <p className="text-xl font-bold tracking-tight">{stats.completedAssignments}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Avg HI</p>
          <p className="text-xl font-bold tracking-tight">{avgHi.toFixed(1)}</p>
        </div>
      </div>

      {/* Section 2: Influence Propagation */}
      <h2 className="text-lg font-bold mb-3">Influence Propagation</h2>
      <Card className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Amplified by</p>
        {amplifiers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {amplifiers.map((amp) => (
              <div key={amp.handle} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-500">
                  {typeof amp.avatar === "string" && amp.avatar.length === 1 ? amp.avatar : amp.handle.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">@{amp.handle}</p>
                </div>
                <p className="text-sm font-bold text-emerald-600">+{amp.hi.toFixed(1)} HI</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No amplifications yet. Your influence grows as others share your content.</p>
        )}
      </Card>

      {/* Section 3: Amplification Opportunities */}
      <h2 className="text-lg font-bold mb-3">Amplification Opportunities</h2>
      <div className="flex flex-col gap-3 mb-8">
        {ampOpportunities.length > 0 ? (
          ampOpportunities.map((opp) => (
            <Card key={opp.postId}>
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{opp.businessName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">by @{opp.creatorHandle}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-emerald-600">+{opp.potentialHi.toFixed(1)} HI</p>
                  <p className="text-xs text-gray-400">potential</p>
                </div>
              </div>
              <div className="mt-3">
                <AmplifyButton postId={opp.postId} creatorId={DEMO_CREATOR_ID} />
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-gray-400 text-center py-2">
              No amplification opportunities right now. Check back when other creators post.
            </p>
          </Card>
        )}
      </div>

      {/* Section 4: Your Network */}
      <h2 className="text-lg font-bold mb-3">Your Network</h2>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Referred</p>
          <p className="text-xl font-bold tracking-tight">{referrals.length}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Network HI</p>
          <p className="text-xl font-bold tracking-tight">{networkHi.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Earned</p>
          <p className="text-xl font-bold tracking-tight text-emerald-600">${networkEarnings.toFixed(0)}</p>
        </div>
      </div>

      {/* Neighborhood density */}
      {neighborhood && (
        <Card className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">{neighborhood}</p>
              <p className="text-lg font-bold">{neighborhoodHi.toFixed(1)} HI this week</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">Your referral code</h3>
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center p-3">
            <QrCode url={referralLink} />
          </div>
        </div>
        <ReferralActions referralLink={referralLink} referralCode={referralCode} />
      </Card>

      {/* Section 5: Influence Rank */}
      <h2 className="text-lg font-bold mb-3">Influence Rank</h2>
      <Card>
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="black" strokeWidth="3"
                strokeDasharray={`${profile?.higScore ?? 0} ${100 - (profile?.higScore ?? 0)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {profile?.higScore ?? 0}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">HIG {profile?.higScore ?? 0}/100</p>
            <p className="text-sm text-gray-500">#{cityRank} in Los Angeles</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
