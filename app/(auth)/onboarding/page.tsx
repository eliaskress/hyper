"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "creator" | "restaurant" | null;

export default function OnboardingPage() {
  const [role, setRole] = useState<Role>(null);
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleContinue() {
    const handle = instagram.trim().replace(/^@/, "");
    if (!handle) {
      setError("Instagram handle is required.");
      return;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
      setError("Invalid Instagram handle.");
      return;
    }
    // Demo mode: navigate directly
    if (role === "creator") {
      router.push("/influencer");
    } else {
      router.push("/brand");
    }
  }

  if (!role) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
        <p className="text-gray-600 mb-8">Pick your role. This can&apos;t be changed later.</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setRole("restaurant")}
            className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors"
          >
            <h2 className="font-bold text-lg">I&apos;m a Restaurant</h2>
            <p className="text-gray-600 text-sm">Submit a briefing and let Hyper run your campaign.</p>
          </button>
          <button
            onClick={() => setRole("creator")}
            className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors"
          >
            <h2 className="font-bold text-lg">I&apos;m a Creator</h2>
            <p className="text-gray-600 text-sm">Get matched with restaurants and earn based on your influence.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => { setRole(null); setInstagram(""); setError(""); }}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold mb-2">Connect Instagram</h1>
      <p className="text-gray-600 mb-6">
        {role === "creator"
          ? "Your Instagram is how Hyper verifies your profile and tracks your posts."
          : "Your Instagram helps creators tag your restaurant in their content."}
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-1 rounded-xl border-2 border-gray-200 px-4 py-3.5 focus-within:border-black transition-colors">
          <span className="text-gray-400">@</span>
          <input
            type="text"
            value={instagram}
            onChange={(e) => { setInstagram(e.target.value); setError(""); }}
            placeholder="yourhandle"
            className="flex-1 text-base bg-transparent focus:outline-none"
            autoFocus
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={handleContinue}
          className="w-full rounded-xl bg-black text-white py-3.5 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all min-h-[44px]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
