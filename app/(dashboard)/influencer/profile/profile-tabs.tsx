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
  createdAt: Date;
}

interface Stats {
  totalApplications: number;
  acceptedCampaigns: number;
  completedCampaigns: number;
  totalEarned: string;
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
            <p className="text-xs text-gray-400 mt-0.5">
              Auto-linked from Instagram OAuth
            </p>
          </InfoRow>
          <InfoRow label="Followers">
            <p className="font-semibold text-lg">
              {profile.followersCount
                ? profile.followersCount.toLocaleString()
                : "Syncing..."}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Pulled from Instagram API
            </p>
          </InfoRow>
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
          <MiniStat label="Campaigns" value={stats.completedCampaigns} />
          <MiniStat label="Total Earned" value={`$${stats.totalEarned}`} />
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
              Connect your Stripe account to receive payouts for completed campaigns.
              Hyper uses Stripe Connect Express for fast, secure transfers.
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
            { step: "1", text: "Complete a campaign and submit your post" },
            { step: "2", text: "The restaurant reviews and approves your content" },
            { step: "3", text: "Payment is released to your Stripe account" },
            { step: "4", text: "Funds arrive in 2-3 business days" },
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
