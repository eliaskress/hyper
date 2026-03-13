"use client";

import { useState } from "react";
import { Card } from "./card";

interface EmailPrefs {
  newMatches: boolean;
  expiringMatches: boolean;
  dailyDigest: boolean;
  paymentReceived: boolean;
  creatorPosted: boolean;
  hiMeasured: boolean;
  weeklySummary: boolean;
}

const DEFAULT_PREFS: EmailPrefs = {
  newMatches: true,
  expiringMatches: true,
  dailyDigest: true,
  paymentReceived: true,
  creatorPosted: true,
  hiMeasured: true,
  weeklySummary: true,
};

const CREATOR_TOGGLES: { key: keyof EmailPrefs; label: string; description: string }[] = [
  { key: "newMatches", label: "New matches", description: "When Hyper matches you with a restaurant" },
  { key: "expiringMatches", label: "Expiring matches", description: "Reminder before a match expires" },
  { key: "dailyDigest", label: "Daily digest", description: "Morning summary of today's visits and pending matches" },
  { key: "paymentReceived", label: "Payment received", description: "When you get paid for a collab" },
];

const BRAND_TOGGLES: { key: keyof EmailPrefs; label: string; description: string }[] = [
  { key: "creatorPosted", label: "Creator posted", description: "When a creator posts about your restaurant" },
  { key: "hiMeasured", label: "HI results", description: "When a post's HI score is measured" },
  { key: "weeklySummary", label: "Weekly summary", description: "Weekly campaign performance report" },
];

export function EmailPreferences({
  userId,
  role,
  email,
  preferences,
}: {
  userId: string;
  role: "creator" | "brand";
  email: string | null;
  preferences: Partial<EmailPrefs> | null;
}) {
  const merged = { ...DEFAULT_PREFS, ...preferences };
  const [prefs, setPrefs] = useState<EmailPrefs>(merged);
  const [emailValue, setEmailValue] = useState(email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggles = role === "creator" ? CREATOR_TOGGLES : BRAND_TOGGLES;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profile/email-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: emailValue || null, emailPreferences: prefs }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof EmailPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {/* Email address */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Email Address</h3>
        <input
          type="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="your@email.com"
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
        />
        <p className="text-xs text-gray-400 mt-1">We&apos;ll send notifications to this address.</p>
      </Card>

      {/* Toggles */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Email Notifications</h3>
        <div className="space-y-0">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400">{t.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(t.key)}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                  prefs[t.key] ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    prefs[t.key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
      >
        {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
      </button>
    </div>
  );
}
