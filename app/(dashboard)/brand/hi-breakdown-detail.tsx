"use client";

import { useState } from "react";

export function HiBreakdownDetail() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] text-gray-500 font-medium hover:text-gray-700 transition-colors flex items-center gap-1"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        How HI works
      </button>
      {open && (
        <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
          <p className="font-mono text-[11px] mb-1.5">
            HI = 100 &times; (Likes + 2&times;Comments + 6&times;Saves + 8&times;Shares) / Reach
          </p>
          <p>
            Reach is measured 7 days after posting. Higher-weight actions (saves, shares) indicate deeper engagement and broader spread.
          </p>
        </div>
      )}
    </div>
  );
}
