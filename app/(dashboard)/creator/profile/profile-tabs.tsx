"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type Tab = "info" | "payments";

interface Profile {
  id: string;
  handle: string;
  instagramId: string;
  avatar: string | null;
  followersCount: number | null;
  location: string | null;
  stripeAccountId: string | null;
  xp: number;
  tier: string;
  higScore: number;
  primaryPlatform: string | null;
  platforms: string[] | null;
  createdAt: Date;
}

interface Stats {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  totalEarned: string;
  totalHi: string;
  badges: { id: string; badgeType: string }[];
}

export function ProfileTabs({ profile, stats }: { profile: Profile; stats: Stats }) {
  const [tab, setTab] = useState<Tab>("info");

  return (
    <>
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("info")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            tab === "info"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setTab("payments")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            tab === "payments"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Payments
        </button>
      </div>

      {tab === "info" ? (
        <InfoTab profile={profile} stats={stats} />
      ) : (
        <PaymentsTab profile={profile} />
      )}
    </>
  );
}

function InfoTab({ profile, stats }: { profile: Profile; stats: Stats }) {
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(profile.handle);
  const [location, setLocation] = useState(profile.location ?? "");
  const [primaryPlatform, setPrimaryPlatform] = useState(profile.primaryPlatform ?? "instagram");
  const [platforms, setPlatforms] = useState<string[]>(profile.platforms ?? []);
  const [newPlatformUrl, setNewPlatformUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    if (!handle.trim()) {
      setError("Handle is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creators/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          handle: handle.trim(),
          location: location.trim() || undefined,
          primaryPlatform,
          platforms: platforms.length > 0 ? platforms : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + handle header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-bold text-gray-500">
          {profile.handle.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold">@{profile.handle}</p>
          <p className="text-sm text-gray-400">{profile.location ?? "Location not set"}</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <Card>
          <h2 className="font-bold mb-3">Edit Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Handle</label>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm text-gray-400">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="flex-1 text-sm bg-transparent focus:outline-none min-h-[24px]"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Los Angeles, CA"
                className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Primary Platform</label>
              <div className="flex gap-2">
                {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrimaryPlatform(p)}
                    className={`flex-1 text-sm py-2 rounded-lg font-semibold capitalize transition-all min-h-[40px] ${
                      primaryPlatform === p
                        ? "bg-black text-white"
                        : "border-2 border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Platform URLs</label>
              {platforms.map((url, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-1.5">
                  <p className="flex-1 text-sm text-gray-700 truncate">{url.replace(/https?:\/\//, "")}</p>
                  <button
                    type="button"
                    onClick={() => setPlatforms((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-1.5 mt-1">
                <input
                  type="url"
                  value={newPlatformUrl}
                  onChange={(e) => setNewPlatformUrl(e.target.value)}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[40px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newPlatformUrl.trim();
                    if (trimmed && !platforms.includes(trimmed)) {
                      setPlatforms((prev) => [...prev, trimmed]);
                      setNewPlatformUrl("");
                    }
                  }}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-all min-h-[40px]"
                >
                  Add
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setHandle(profile.handle);
                  setLocation(profile.location ?? "");
                  setPrimaryPlatform(profile.primaryPlatform ?? "instagram");
                  setPlatforms(profile.platforms ?? []);
                  setNewPlatformUrl("");
                  setError("");
                }}
                className="rounded-xl border-2 border-gray-200 px-5 py-3 font-semibold text-sm hover:bg-gray-50 transition-all min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* HIG Score */}
      <Card>
        <h2 className="font-bold mb-3">HIG Score</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="black" strokeWidth="3"
                strokeDasharray={`${profile.higScore} ${100 - profile.higScore}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {profile.higScore}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Your Hyper Influence Grade determines which restaurants you&apos;re matched with.</p>
            <p className="text-xs text-gray-400 mt-1">Higher HIG = better assignments</p>
          </div>
        </div>
      </Card>

      {/* Platforms */}
      <Card>
        <h2 className="font-bold mb-3">Platforms</h2>
        <div className="flex flex-col divide-y divide-gray-100">
          {(profile.platforms && profile.platforms.length > 0 ? profile.platforms : []).map((url, i) => {
            const platformName = parsePlatformName(url);
            const isPrimary = platformName === (profile.primaryPlatform ?? "instagram");
            return (
              <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm font-semibold capitalize shrink-0">{platformName}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline truncate"
                  >
                    {url.replace(/https?:\/\//, "")}
                  </a>
                </div>
                <span className="text-sm font-medium text-gray-600 shrink-0 ml-3">
                  {isPrimary && profile.followersCount
                    ? profile.followersCount.toLocaleString()
                    : "-"}
                </span>
              </div>
            );
          })}
          {(!profile.platforms || profile.platforms.length === 0) && (
            <p className="text-sm text-gray-400">No platforms linked yet</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <InfoRow label="Location">
            <p className="font-medium">{profile.location ?? "Not set"}</p>
          </InfoRow>
          <InfoRow label="Member since">
            <p className="font-medium">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </InfoRow>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <MiniStat label="Tier" value={profile.tier} capitalize />
          <MiniStat label="XP" value={profile.xp.toLocaleString()} />
          <MiniStat label="Collabs" value={stats.completedAssignments} />
          <MiniStat label="Total Earned" value={`$${stats.totalEarned}`} />
          <MiniStat label="Total HI" value={parseFloat(stats.totalHi).toFixed(1)} />
          <MiniStat label="HIG Score" value={`${profile.higScore}/100`} />
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

function PaymentsTab({ profile }: { profile: Profile }) {
  const isConnected = !!profile.stripeAccountId;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="font-bold mb-4">Payout Method</h2>
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <p className="font-semibold">
            {isConnected ? "Stripe Connected" : "Not connected"}
          </p>
        </div>

        {isConnected ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Account ID</p>
              <p className="text-sm font-mono text-gray-600 mt-1">{profile.stripeAccountId}</p>
            </div>
            <button className="w-full rounded-xl border-2 border-gray-100 py-3.5 font-semibold text-sm hover:bg-gray-50 hover:border-gray-200 transition-all min-h-[44px]">
              Open Stripe Dashboard
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Connect your Stripe account to receive payouts. Hyper uses Stripe Connect Express for fast, secure transfers.
            </p>
            <button className="w-full rounded-xl bg-black text-white py-3.5 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10 min-h-[44px]">
              Connect Stripe Account
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-bold mb-4">How Payouts Work</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "1", text: "Hyper matches you with a collab" },
            { step: "2", text: "Visit, create content, and post" },
            { step: "3", text: "Send analytics 7 days later and HI is calculated" },
            { step: "4", text: "Earn $4/HI (40% creator share of $10/HI)" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {item.step}
              </span>
              <p className="text-sm text-gray-600 pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">{label}</p>
      {children}
    </div>
  );
}

function MiniStat({ label, value, capitalize }: { label: string; value: string | number; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function parsePlatformName(url: string): string {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("youtube.com")) return "youtube";
  try {
    return new URL(url).hostname.replace("www.", "").split(".")[0];
  } catch {
    return "other";
  }
}
