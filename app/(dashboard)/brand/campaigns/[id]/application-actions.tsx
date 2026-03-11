"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function handleAction(status: "accepted" | "rejected") {
    setLoading(status === "accepted" ? "accept" : "reject");
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return;
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 pt-3 border-t border-gray-50">
      <button
        onClick={() => handleAction("accepted")}
        disabled={loading !== null}
        className="flex-1 rounded-xl bg-black text-white py-2.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {loading === "accept" ? "Accepting..." : "Accept"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading !== null}
        className="flex-1 rounded-xl border-2 border-gray-100 text-gray-600 py-2.5 text-sm font-semibold hover:bg-gray-50 hover:border-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {loading === "reject" ? "Declining..." : "Decline"}
      </button>
    </div>
  );
}
