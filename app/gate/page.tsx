"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);

    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Hyper</h1>
        <p className="text-gray-400 text-sm mb-8">Enter the password to continue.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium outline-none transition-colors ${
              error
                ? "border-red-300 bg-red-50 text-red-900 placeholder:text-red-300"
                : "border-gray-100 bg-white text-black placeholder:text-gray-400 focus:border-black"
            }`}
          />
          {error && (
            <p className="text-sm text-red-500 font-medium">Wrong password</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
