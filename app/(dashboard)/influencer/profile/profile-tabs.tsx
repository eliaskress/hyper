"use client";

import { useState } from "react";
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
  const instagramUrl = `https://instagram.com/${profile.handle}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + handle header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-bold text-gray-500">
          {profile.handle.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xl font-bold">@{profile.handle}</p>
          <p className="text-sm text-gray-400">{profile.location ?? "Location not set"}</p>
        </div>
      </div>

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

      <Card>
        <div className="flex flex-col gap-4">
          <InfoRow label="Instagram">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium hover:underline"
            >
              instagram.com/{profile.handle}
            </a>
          </InfoRow>
          <InfoRow label="Followers">
            <p className="font-semibold text-lg">
              {profile.followersCount
                ? profile.followersCount.toLocaleString()
                : "Syncing..."}
            </p>
          </InfoRow>
          <InfoRow label="Primary Platform">
            <p className="font-medium capitalize">{profile.primaryPlatform ?? "Instagram"}</p>
          </InfoRow>
          {profile.platforms && profile.platforms.length > 0 && (
            <InfoRow label="Platforms">
              <div className="flex flex-col gap-1">
                {profile.platforms.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline truncate"
                  >
                    {url.replace(/https?:\/\//, "")}
                  </a>
                ))}
              </div>
            </InfoRow>
          )}
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
          <MiniStat label="Assignments" value={stats.completedAssignments} />
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
            { step: "1", text: "Hyper matches you with a restaurant" },
            { step: "2", text: "Visit, create content, and post" },
            { step: "3", text: "Send analytics 7 days later — HI is calculated" },
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
