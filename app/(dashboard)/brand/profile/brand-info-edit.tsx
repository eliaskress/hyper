"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  brandId: string;
  currentName: string;
  currentAddress: string;
  verified: boolean;
  createdAt: string;
}

export function BrandInfoEdit({ brandId, currentName, currentAddress, verified, createdAt }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [address, setAddress] = useState(currentAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/brands/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          businessName: name.trim(),
          address: address.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update.");
        return;
      }
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
      <>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-bold text-gray-500">
            {currentName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{currentName}</p>
            <p className="text-sm text-gray-500">{currentAddress}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Verified</span>
            <span className="text-sm font-medium">{verified ? "Yes" : "Pending"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm font-medium">
              {new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Business Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Los Angeles, CA"
          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => { setEditing(false); setName(currentName); setAddress(currentAddress); setError(""); }}
          className="rounded-xl border-2 border-gray-200 px-5 py-3 font-semibold text-sm hover:bg-gray-50 transition-all min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
