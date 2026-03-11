"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BriefingStatusToggle({ briefingId, currentStatus }: { briefingId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isPaused = currentStatus === "paused";
  const isCompleted = currentStatus === "completed";

  if (isCompleted) return null;

  async function handleToggle() {
    setLoading(true);
    setError("");
    try {
      const newStatus = isPaused ? "active" : "paused";
      const res = await fetch("/api/briefings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update status.");
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
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all min-h-[32px] ${
          isPaused
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        } disabled:opacity-50`}
      >
        {loading ? "..." : isPaused ? "Resume" : "Pause"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
