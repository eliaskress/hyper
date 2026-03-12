"use client";

import { useState } from "react";
import { PRICE_PER_HI } from "@/lib/hi";

export function HiTooltip() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((v) => !v)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold hover:bg-gray-300 transition-colors"
        aria-label="What is HI?"
      >
        ?
      </button>
      {show && (
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
  );
}
