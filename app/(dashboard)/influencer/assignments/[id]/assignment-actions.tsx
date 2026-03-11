"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MEAL_TIMES: Record<string, { label: string; start: string; end: string }> = {
  breakfast: { label: "Breakfast", start: "08:00", end: "11:00" },
  lunch: { label: "Lunch", start: "11:00", end: "15:00" },
  dinner: { label: "Dinner", start: "17:00", end: "22:00" },
};

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

interface Props {
  assignmentId: string;
  status: string;
  hasPost: boolean;
  hasSchedule: boolean;
  availabilityDays: string[];
  availabilityMeals: string[];
}

export function AssignmentActions({ assignmentId, status: initialStatus, hasPost, availabilityDays, availabilityMeals }: Props) {
  const [status, setStatus] = useState(initialStatus);

  return (
    <div className="space-y-3 mt-2">
      {status === "invited" && (
        <AcceptDecline assignmentId={assignmentId} onAccepted={() => setStatus("accepted")} />
      )}
      {status === "accepted" && (
        <ScheduleVisit
          assignmentId={assignmentId}
          availabilityDays={availabilityDays}
          availabilityMeals={availabilityMeals}
          onScheduled={() => setStatus("scheduled")}
        />
      )}
      {(status === "accepted" || (status === "scheduled" && !hasPost)) && (
        <SubmitPost assignmentId={assignmentId} />
      )}
    </div>
  );
}

function AcceptDecline({ assignmentId, onAccepted }: { assignmentId: string; onAccepted: () => void }) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAccept() {
    setLoading("accept");
    setError("");
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "accept" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to accept.");
        return;
      }
      onAccepted();
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDecline() {
    if (!reason.trim()) {
      setError("Please provide a reason for declining.");
      return;
    }
    setLoading("decline");
    setError("");
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "decline", declineReason: reason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to decline.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border-2 border-gray-100 p-4">
      <h3 className="text-sm font-semibold mb-3">Respond to invitation</h3>

      {!showDecline ? (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={!!loading}
            className="flex-1 rounded-xl bg-emerald-600 text-white py-3 font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading === "accept" ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={() => setShowDecline(true)}
            disabled={!!loading}
            className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 min-h-[44px]"
          >
            Decline
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            placeholder="Why are you declining? (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              disabled={!!loading}
              className="flex-1 rounded-xl bg-red-600 text-white py-3 font-semibold text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
            >
              {loading === "decline" ? "Declining..." : "Confirm Decline"}
            </button>
            <button
              onClick={() => { setShowDecline(false); setReason(""); setError(""); }}
              disabled={!!loading}
              className="rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 min-h-[44px]"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function ScheduleVisit({
  assignmentId,
  availabilityDays,
  availabilityMeals,
  onScheduled,
}: {
  assignmentId: string;
  availabilityDays: string[];
  availabilityMeals: string[];
  onScheduled: () => void;
}) {
  const [date, setDate] = useState("");
  const [meal, setMeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function isDateAllowed(dateStr: string) {
    if (!dateStr) return false;
    const d = new Date(dateStr + "T12:00:00");
    const dayIndex = d.getDay();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return availabilityDays.includes(dayNames[dayIndex]);
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (!isDateAllowed(date)) {
      setError(`This restaurant is only available on: ${availabilityDays.map(d => DAY_LABELS[d] || d).join(", ")}`);
      return;
    }
    if (!meal) {
      setError("Please select a mealtime.");
      return;
    }
    const mealTime = MEAL_TIMES[meal];
    if (!mealTime) {
      setError("Invalid mealtime.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          action: "schedule",
          scheduledDate: date,
          scheduleTimeStart: mealTime.start,
          scheduleTimeEnd: mealTime.end,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to schedule.");
        return;
      }
      onScheduled();
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSchedule} className="rounded-xl border-2 border-gray-100 p-4">
      <h3 className="text-sm font-semibold mb-1">Schedule your visit</h3>
      <p className="text-xs text-gray-500 mb-3">
        Pick a day and mealtime from the restaurant&apos;s availability.
      </p>

      <div className="space-y-3">
        {/* Date */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
          />
          {availabilityDays.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-1">
              Available: {availabilityDays.map(d => DAY_LABELS[d] || d).join(", ")}
            </p>
          )}
          {date && !isDateAllowed(date) && (
            <p className="text-[11px] text-red-500 mt-1">
              This day isn&apos;t available. Pick a {availabilityDays.map(d => DAY_LABELS[d] || d).join(", ")}.
            </p>
          )}
        </div>

        {/* Mealtime */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1.5">Mealtime</label>
          <div className="flex gap-2">
            {(["breakfast", "lunch", "dinner"] as const).map((m) => {
              const available = availabilityMeals.includes(m);
              const selected = meal === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={!available}
                  onClick={() => setMeal(m)}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all min-h-[44px] capitalize ${
                    selected
                      ? "bg-black text-white"
                      : available
                      ? "border-2 border-gray-200 text-gray-700 hover:border-gray-400"
                      : "border-2 border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-3 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "Scheduling..." : "Confirm Schedule"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
}

function SubmitPost({ assignmentId }: { assignmentId: string }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste your post link.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, postUrl: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border-2 border-gray-100 p-4">
      <h3 className="text-sm font-semibold mb-1">Submit your post</h3>
      <p className="text-xs text-gray-500 mb-3">
        Paste your Instagram post link. This is the source of truth for your HI calculation.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://instagram.com/p/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-2.5 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "..." : "Submit"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
}
