"use client";

import { useState } from "react";

export function ReferralActions({
  referralLink,
}: {
  referralLink: string;
  referralCode?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Hyper",
          text: "Sign up for Hyper and start earning from your content.",
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyLink();
    }
  }

  return (
    <div>
      {/* Link display */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
        <p className="flex-1 text-sm text-gray-700 font-mono truncate">{referralLink}</p>
        <button
          onClick={copyLink}
          className="shrink-0 text-xs font-semibold text-black hover:text-gray-600 transition-colors min-h-[32px] px-2"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-semibold text-sm hover:bg-gray-50 transition-all min-h-[44px]"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={shareLink}
          className="flex-1 rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10 min-h-[44px]"
        >
          Share
        </button>
      </div>
    </div>
  );
}
