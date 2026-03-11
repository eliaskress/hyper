"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Hyper</h1>
      <p className="text-gray-600 mb-8">
        Pick a role to explore the demo.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            signIn("demo-login", { callbackUrl: "/dashboard/influencer", role: "influencer" })
          }
          className="w-full rounded-xl border-2 border-gray-200 p-5 text-left hover:border-black transition-colors"
        >
          <span className="font-bold text-lg block">Creator</span>
          <span className="text-gray-600 text-sm">
            Browse campaigns, earn money for your reach.
          </span>
        </button>
        <button
          onClick={() =>
            signIn("demo-login", { callbackUrl: "/dashboard/brand", role: "brand" })
          }
          className="w-full rounded-xl border-2 border-gray-200 p-5 text-left hover:border-black transition-colors"
        >
          <span className="font-bold text-lg block">Restaurant</span>
          <span className="text-gray-600 text-sm">
            Post campaigns, find local creators.
          </span>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Demo mode — no real authentication required.
      </p>
    </div>
  );
}
