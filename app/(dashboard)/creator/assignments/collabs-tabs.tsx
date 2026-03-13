"use client";

import { useState } from "react";

export function CollabsTabs({
  openTab,
  myTab,
  openCount,
  myCount,
}: {
  openTab: React.ReactNode;
  myTab: React.ReactNode;
  openCount: number;
  myCount: number;
}) {
  const [active, setActive] = useState<"open" | "my">("open");

  return (
    <>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActive("open")}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
            active === "open"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="relative">
            New Matches{openCount > 0 ? ` (${openCount})` : ""}
            {openCount > 0 && active !== "open" && (
              <span className="absolute -top-1 -right-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </span>
        </button>
        <button
          onClick={() => setActive("my")}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
            active === "my"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Collabs{myCount > 0 ? ` (${myCount})` : ""}
        </button>
      </div>
      {active === "open" ? openTab : myTab}
    </>
  );
}
