"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AmplifyButton({ postId, creatorId }: { postId: string; creatorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAmplify() {
    setLoading(true);
    try {
      const res = await fetch("/api/amplifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, amplifierCreatorId: creatorId }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span className="text-xs font-medium text-emerald-600">Amplified</span>
    );
  }

  return (
    <button
      onClick={handleAmplify}
      disabled={loading}
      className="text-xs font-semibold text-white bg-black rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? "Amplifying..." : "Amplify"}
    </button>
  );
}
