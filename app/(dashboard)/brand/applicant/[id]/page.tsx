export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorProfile, getCreatorStats } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";

export default async function ApplicantProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCreatorProfile(id);

  if (!profile) notFound();

  const stats = await getCreatorStats(id);
  const instagramUrl = `https://instagram.com/${profile.handle}`;

  return (
    <div>
      <Link
        href="/brand/campaigns"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors mb-4"
      >
        &larr; Back
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-bold text-gray-500">
          {profile.handle.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">@{profile.handle}</h1>
          <p className="text-sm text-gray-400">{profile.location ?? "Location not set"}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xl font-bold">
            {profile.followersCount ? profile.followersCount.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Followers</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xl font-bold">{stats.completedCampaigns}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Campaigns</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xl font-bold capitalize">{profile.tier}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Tier</p>
        </div>
      </div>

      {/* Details */}
      <Card className="mb-4">
        <h2 className="font-bold mb-4">Creator Details</h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Instagram</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              instagram.com/{profile.handle}
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Location</span>
            <span className="text-sm font-medium">{profile.location ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">XP</span>
            <span className="text-sm font-medium">{profile.xp.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Member since</span>
            <span className="text-sm font-medium">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Card>

      {stats.badges.length > 0 && (
        <Card>
          <h2 className="font-bold mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <span
                key={badge.id}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold capitalize"
              >
                {badge.badgeType.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
