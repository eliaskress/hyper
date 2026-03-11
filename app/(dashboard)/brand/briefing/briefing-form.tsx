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
  budgetType?: string;
}

export function BriefingForm({ existing }: { existing?: BriefingData }) {
  const isEdit = !!existing?.id;
  const [contentBrief, setContentBrief] = useState(existing?.contentBrief ?? "");
  const [offerDescription, setOfferDescription] = useState(existing?.offerDescription ?? "");
  const [days, setDays] = useState<string[]>(existing?.availabilityDays ?? []);
  const [meals, setMeals] = useState<string[]>(existing?.availabilityMeals ?? []);
  const [budgetHi, setBudgetHi] = useState(existing?.budgetHi ?? "");
  const [budgetType, setBudgetType] = useState(existing?.budgetType ?? "per_engagement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function toggleDay(day: string) {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function toggleMeal(meal: string) {
    setMeals((prev) => prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]);
  }

  const budgetUsd = budgetHi ? (parseFloat(budgetHi) * PRICE_PER_HI) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = "/api/briefings";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit
        ? { briefingId: existing!.id, contentBrief, offerDescription: offerDescription || undefined, availabilityDays: days, availabilityMeals: meals, budgetHi, budgetType }
        : { contentBrief, offerDescription: offerDescription || undefined, availabilityDays: days, availabilityMeals: meals, budgetHi, budgetType };

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
      {/* Content Brief */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-1.5">Content Brief</label>
        <textarea
          value={contentBrief}
          onChange={(e) => setContentBrief(e.target.value)}
          placeholder="Describe what creators should capture — atmosphere, dishes, experience..."
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
        <p className="text-xs text-gray-400 mt-1">Creators see this when deciding whether to accept</p>
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

      {/* Budget */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-1.5">Budget (HI)</label>
        <input
          type="number"
          step="0.01"
          min="1"
          value={budgetHi}
          onChange={(e) => setBudgetHi(e.target.value)}
          placeholder="e.g. 50"
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
        />
        {budgetHi && budgetUsd > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {budgetHi} HI = <span className="font-semibold">${budgetUsd.toFixed(0)}</span> at ${PRICE_PER_HI}/HI
          </p>
        )}
      </div>

      {/* Budget Type */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">Budget Type</label>
        <div className="flex gap-2">
          {[
            { value: "per_engagement", label: "Per Engagement" },
            { value: "monthly", label: "Monthly" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBudgetType(opt.value)}
              className={`flex-1 text-sm py-2.5 rounded-lg font-semibold transition-all min-h-[44px] ${
                budgetType === opt.value
                  ? "bg-black text-white"
                  : "border-2 border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
