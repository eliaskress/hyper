"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAll() {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, markAll: true }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
    >
      {loading ? "Marking..." : "Mark all read"}
    </button>
  );
}
