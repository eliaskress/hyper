"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_PER_HI } from "@/lib/hi";

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};
const ALL_MEALS = ["breakfast", "lunch", "dinner"];

interface BriefingData {
  id?: string;
  contentBrief?: string;
  offerDescription?: string;
  availabilityDays?: string[];
  availabilityMeals?: string[];
  budgetHi?: string;
  responseHours?: number;
}

function hiFromUsd(usd: number) {
  return usd / PRICE_PER_HI;
}

export function BriefingForm({ existing }: { existing?: BriefingData }) {
  const isEdit = !!existing?.id;
  const existingUsd = existing?.budgetHi
    ? (parseFloat(existing.budgetHi) * PRICE_PER_HI).toString()
    : "";

  const [budgetUsd, setBudgetUsd] = useState(existingUsd);
  const [contentBrief, setContentBrief] = useState(existing?.contentBrief ?? "");
  const [offerDescription, setOfferDescription] = useState(existing?.offerDescription ?? "");
  const [days, setDays] = useState<string[]>(existing?.availabilityDays ?? []);
  const [meals, setMeals] = useState<string[]>(existing?.availabilityMeals ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHiTooltip, setShowHiTooltip] = useState(false);
  const [showVibeInput, setShowVibeInput] = useState(false);
  const [vibeWords, setVibeWords] = useState("");
  const router = useRouter();

  const usdNum = parseFloat(budgetUsd) || 0;
  const budgetHi = hiFromUsd(usdNum);

  function toggleDay(day: string) {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function toggleMeal(meal: string) {
    setMeals((prev) => prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const hiValue = budgetHi.toFixed(2);

    try {
      const url = "/api/briefings";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit
        ? { briefingId: existing!.id, contentBrief, offerDescription: offerDescription || undefined, availabilityDays: days, availabilityMeals: meals, budgetHi: hiValue }
        : { contentBrief, offerDescription: offerDescription || undefined, availabilityDays: days, availabilityMeals: meals, budgetHi: hiValue };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save briefing.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Budget */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-semibold text-gray-900">Monthly limit ($)</label>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowHiTooltip(true)}
              onMouseLeave={() => setShowHiTooltip(false)}
              onClick={() => setShowHiTooltip((v) => !v)}
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold hover:bg-gray-300 transition-colors"
              aria-label="What is HI?"
            >
              ?
            </button>
            {showHiTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-lg z-10 leading-relaxed">
                <p className="font-semibold mb-1">How HI works</p>
                <p className="mb-1.5">HI (Hyper Influence) measures real engagement impact:</p>
                <p className="font-mono text-[11px] bg-white/10 rounded-lg px-2 py-1 mb-1.5">
                  HI = 100 &times; (Likes + 2&times;Comments + 6&times;Saves + 8&times;Shares) / Reach
                </p>
                <p>Your budget in dollars is converted at <span className="font-semibold">${PRICE_PER_HI}/HI</span>. Creators earn 40% of each HI unit they generate.</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input
            type="number"
            step="1"
            min="10"
            value={budgetUsd}
            onChange={(e) => setBudgetUsd(e.target.value)}
            placeholder="e.g. 500"
            className="w-full text-sm rounded-xl border border-gray-200 pl-7 pr-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
          />
        </div>
        {usdNum > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            ${usdNum.toFixed(0)} = <span className="font-semibold">{budgetHi.toFixed(1)} HI</span> at ${PRICE_PER_HI}/HI
          </p>
        )}
      </div>

      {/* Content Brief */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-900">Content Brief</label>
          <button
            type="button"
            onClick={() => {
              if (showVibeInput) {
                setShowVibeInput(false);
              } else {
                setShowVibeInput(true);
              }
            }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Generate Brief with AI
          </button>
        </div>
        {showVibeInput && (
          <div className="mb-2 space-y-2">
            <input
              type="text"
              value={vibeWords}
              onChange={(e) => setVibeWords(e.target.value)}
              placeholder="Describe the vibe: cozy, golden hour, friends, outdoor..."
              className="w-full text-sm rounded-xl border border-indigo-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => {
                if (!vibeWords.trim()) return;
                const words = vibeWords.split(",").map((w) => w.trim()).filter(Boolean);
                const brief = `Post a Reel or Story capturing the ${words.join(", ")} vibe. Show the experience, not just the food. Tag us and keep it authentic.`;
                setContentBrief(brief);
                setShowVibeInput(false);
                setVibeWords("");
              }}
              className="w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all min-h-[44px]"
            >
              Generate
            </button>
          </div>
        )}
        <textarea
          value={contentBrief}
          onChange={(e) => setContentBrief(e.target.value)}
          placeholder="Describe what creators should capture: atmosphere, dishes, experience..."
          rows={4}
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </div>

      {/* Offer Description */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-1.5">What&apos;s Included</label>
        <textarea
          value={offerDescription}
          onChange={(e) => setOfferDescription(e.target.value)}
          placeholder="e.g. Free meal for two (up to $50), complimentary drinks..."
          rows={2}
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Creators see this when deciding whether to accept. Leave blank if this is a payment-only collab with no additional perks.</p>
      </div>

      {/* Days */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">Available Days</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                days.includes(day)
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">Meal Times</label>
        <div className="flex gap-2">
          {ALL_MEALS.map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => toggleMeal(meal)}
              className={`flex-1 text-sm py-2.5 rounded-lg font-semibold capitalize transition-all min-h-[44px] ${
                meals.includes(meal)
                  ? "bg-black text-white"
                  : "border-2 border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Response Window Note */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500">Matched creators have <span className="font-semibold text-gray-700">72 hours</span> to respond before the match expires.</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black text-white py-3.5 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-black/10 min-h-[44px]"
      >
        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Briefing"}
      </button>
    </form>
  );
}
