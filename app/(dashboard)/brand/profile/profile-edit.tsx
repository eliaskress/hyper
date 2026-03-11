"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BrandProfileEdit({ brandId, currentHandle }: { brandId: string; currentHandle: string }) {
  const [handle, setHandle] = useState(currentHandle);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    const trimmed = handle.trim().replace(/^@/, "");
    if (!trimmed) {
      setError("Instagram handle is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/brands/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, instagramHandle: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update.");
        return;
      }
      setHandle(trimmed);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div>
        {currentHandle ? (
          <div className="flex items-center justify-between">
            <a
              href={`https://instagram.com/${currentHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium hover:underline"
            >
              @{currentHandle}
            </a>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Edit
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">Connect your Instagram to help creators tag you in their posts.</p>
            <button
              onClick={() => setEditing(true)}
              className="w-full rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all min-h-[44px]"
            >
              Add Instagram
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2.5">
          <span className="text-sm text-gray-400">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourhandle"
            className="flex-1 text-sm bg-transparent focus:outline-none min-h-[24px]"
            autoFocus
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "..." : "Save"}
        </button>
      </div>
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <span />
        )}
        <button
          onClick={() => { setEditing(false); setHandle(currentHandle); setError(""); }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
