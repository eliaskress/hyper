"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_PER_HI } from "@/lib/hi";

export function BudgetEditor({
  briefingId,
  currentBudgetHi,
}: {
  briefingId: string;
  currentBudgetHi: string;
}) {
  const currentUsd = (parseFloat(currentBudgetHi) * PRICE_PER_HI).toString();
  const [editing, setEditing] = useState(false);
  const [budgetUsd, setBudgetUsd] = useState(currentUsd);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const usdNum = parseFloat(budgetUsd) || 0;
  const budgetHi = usdNum / PRICE_PER_HI;

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/briefings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefingId,
          budgetHi: budgetHi.toFixed(2),
        }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Edit spending limit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-xs font-semibold text-gray-700">Monthly limit ($)</label>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip((v) => !v)}
              className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[9px] font-bold hover:bg-gray-300 transition-colors"
              aria-label="How billing works"
            >
              ?
            </button>
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-lg z-10 leading-relaxed">
                <p className="font-semibold mb-1">How billing works</p>
                <p className="mb-1.5">You&apos;re charged based on real engagement your creators generate, measured by HI (Hyper Influence).</p>
                <p className="font-mono text-[10px] bg-white/10 rounded-lg px-2 py-1 mb-1.5">
                  HI = 100 &times; (L + 2C + 6S + 8SH) / R
                </p>
                <p>Rate: <span className="font-semibold">${PRICE_PER_HI}/HI</span>. Your spending limit resets monthly. Add a payment method in Profile.</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input
            type="number"
            step="1"
            min="10"
            value={budgetUsd}
            onChange={(e) => setBudgetUsd(e.target.value)}
            className="w-full text-xs rounded-lg border border-gray-200 pl-6 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        {usdNum > 0 && (
          <p className="text-[10px] text-gray-500 mt-1">
            ${usdNum.toFixed(0)} = {budgetHi.toFixed(1)} HI at ${PRICE_PER_HI}/HI
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(false)}
          className="flex-1 text-xs py-2 rounded-lg border border-gray-200 text-gray-500 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || usdNum < 10}
          className="flex-1 text-xs py-2 rounded-lg bg-black text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
