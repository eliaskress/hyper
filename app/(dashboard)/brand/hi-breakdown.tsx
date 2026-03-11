"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Props {
  hiDelivered: string;
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    reach: number;
  };
}

export function HiBreakdown({ hiDelivered, engagement }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <div className="text-left">
          <p className="text-xs text-gray-500">HI Delivered</p>
          <p className="text-2xl font-bold">{hiDelivered}</p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Engagement Breakdown</p>
          <div className="grid grid-cols-5 gap-1 text-center text-xs">
            <div>
              <p className="text-gray-500">Likes</p>
              <p className="font-medium">{engagement.likes.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Cmts</p>
              <p className="font-medium">{engagement.comments.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Saves</p>
              <p className="font-medium">{engagement.saves.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Shares</p>
              <p className="font-medium">{engagement.shares.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Reach</p>
              <p className="font-medium">{engagement.reach.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            HI = 100 × (L + 2C + 6S + 8SH) / R
          </p>
        </div>
      )}
    </Card>
  );
}
