"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MetricsInput({ assignmentId }: { assignmentId: string }) {
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [saves, setSaves] = useState("");
  const [shares, setShares] = useState("");
  const [reach, setReach] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reach || parseInt(reach) < 1) {
      setError("Reach is required and must be at least 1.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          likes: parseInt(likes) || 0,
          comments: parseInt(comments) || 0,
          saves: parseInt(saves) || 0,
          shares: parseInt(shares) || 0,
          reach: parseInt(reach),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit metrics.");
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
    <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg p-3 mt-2">
      <p className="text-xs font-semibold text-amber-800 mb-2">Enter post metrics</p>
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { label: "Likes", value: likes, set: setLikes },
          { label: "Cmts", value: comments, set: setComments },
          { label: "Saves", value: saves, set: setSaves },
          { label: "Shares", value: shares, set: setShares },
          { label: "Reach", value: reach, set: setReach },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-[10px] text-gray-500 block mb-0.5">{field.label}</label>
            <input
              type="number"
              min="0"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              className="w-full text-xs rounded border border-gray-200 px-1.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="0"
            />
          </div>
        ))}
      </div>
      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 rounded-lg bg-black text-white py-2 text-xs font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[36px]"
      >
        {loading ? "Calculating..." : "Calculate HI"}
      </button>
    </form>
  );
}
