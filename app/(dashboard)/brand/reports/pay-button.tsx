"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({ assignmentId }: { assignmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "pay" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to process payment.");
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
    <div className="mt-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 text-white py-2 text-xs font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[36px]"
      >
        {loading ? "Processing..." : "Mark as Paid"}
      </button>
      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
