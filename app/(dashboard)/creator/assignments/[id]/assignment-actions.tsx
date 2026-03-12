"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MEAL_TIMES: Record<string, { label: string; start: string; end: string }> = {
  breakfast: { label: "Breakfast", start: "08:00", end: "11:00" },
  lunch: { label: "Lunch", start: "11:00", end: "15:00" },
  dinner: { label: "Dinner", start: "17:00", end: "22:00" },
};

const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    color: "from-purple-500 via-pink-500 to-orange-400",
    border: "border-pink-300",
    activeBg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    urlPlaceholder: "https://instagram.com/reel/...",
    urlPattern: /instagram\.com/i,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.21 8.21 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.12z" />
      </svg>
    ),
    color: "from-gray-900 to-gray-800",
    border: "border-gray-400",
    activeBg: "bg-gradient-to-br from-gray-900 to-gray-800",
    urlPlaceholder: "https://tiktok.com/@user/video/...",
    urlPattern: /tiktok\.com/i,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.56 31.56 0 000 12a31.56 31.56 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.56 31.56 0 0024 12a31.56 31.56 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
    color: "from-red-600 to-red-500",
    border: "border-red-300",
    activeBg: "bg-gradient-to-br from-red-600 to-red-500",
    urlPlaceholder: "https://youtube.com/shorts/...",
    urlPattern: /youtu(be\.com|\.be)/i,
  },
] as const;

interface Props {
  assignmentId: string;
  status: string;
  selectedPlatforms: string[];
  submittedPlatforms: string[];
  hasSchedule: boolean;
  availabilityDays: string[];
  availabilityMeals: string[];
}

export function AssignmentActions({
  assignmentId,
  status: initialStatus,
  selectedPlatforms: initialSelectedPlatforms,
  submittedPlatforms,
  availabilityDays,
  availabilityMeals,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialSelectedPlatforms);

  const remainingPlatforms = selectedPlatforms.filter((p) => !submittedPlatforms.includes(p));

  return (
    <div className="space-y-3 mt-2">
      {status === "invited" && (
        <AcceptDecline
          assignmentId={assignmentId}
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
          onAccepted={() => setStatus("accepted")}
        />
      )}
      {(status === "accepted" || status === "scheduled") && (
        <ScheduleVisit
          assignmentId={assignmentId}
          availabilityDays={availabilityDays}
          availabilityMeals={availabilityMeals}
          onScheduled={() => setStatus("scheduled")}
          isReschedule={status === "scheduled"}
        />
      )}
      {(status === "accepted" || status === "scheduled") && remainingPlatforms.length > 0 && (
        <SubmitPosts
          assignmentId={assignmentId}
          platforms={remainingPlatforms}
          onAllSubmitted={() => setStatus("posted")}
        />
      )}
    </div>
  );
}

function AcceptDecline({
  assignmentId,
  selectedPlatforms,
  onPlatformsChange,
  onAccepted,
}: {
  assignmentId: string;
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  onAccepted: () => void;
}) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function togglePlatform(id: string) {
    onPlatformsChange(
      selectedPlatforms.includes(id)
        ? selectedPlatforms.filter((p) => p !== id)
        : [...selectedPlatforms, id],
    );
  }

  async function handleAccept() {
    if (selectedPlatforms.length === 0) {
      setError("Pick at least one platform to post on.");
      return;
    }
    setLoading("accept");
    setError("");
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "accept", selectedPlatforms }),
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
      <h3 className="text-sm font-semibold mb-1">Lock in this collab</h3>
      <p className="text-xs text-gray-500 mb-4">Where will you post?</p>

      {/* Platform selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PLATFORMS.map((platform) => {
          const selected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`relative rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200 min-h-[80px] ${
                selected
                  ? `${platform.activeBg} text-white shadow-lg scale-[1.02]`
                  : `border-2 ${platform.border} bg-white text-gray-600 hover:shadow-md`
              }`}
            >
              {selected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              )}
              {platform.icon}
              <span className="text-[11px] font-semibold">{platform.name}</span>
            </button>
          );
        })}
      </div>

      {!showDecline ? (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={!!loading || selectedPlatforms.length === 0}
            className="flex-1 rounded-xl bg-emerald-600 text-white py-3 font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading === "accept" ? "Accepting..." : `Accept${selectedPlatforms.length > 0 ? ` (${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""})` : ""}`}
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
  isReschedule = false,
}: {
  assignmentId: string;
  availabilityDays: string[];
  availabilityMeals: string[];
  onScheduled: () => void;
  isReschedule?: boolean;
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
    if (!date) { setError("Please select a date."); return; }
    if (!isDateAllowed(date)) {
      setError(`This restaurant is only available on: ${availabilityDays.map(d => DAY_LABELS[d] || d).join(", ")}`);
      return;
    }
    if (!meal) { setError("Please select a mealtime."); return; }
    const mealTime = MEAL_TIMES[meal];
    if (!mealTime) { setError("Invalid mealtime."); return; }

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
      <h3 className="text-sm font-semibold mb-1">{isReschedule ? "Reschedule your visit" : "Schedule your visit"}</h3>
      <p className="text-xs text-gray-500 mb-3">
        Pick a day and mealtime from the restaurant&apos;s availability.
      </p>
      <div className="space-y-3">
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
          {loading ? "Scheduling..." : isReschedule ? "Confirm Reschedule" : "Confirm Schedule"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
}

function SubmitPosts({
  assignmentId,
  platforms,
  onAllSubmitted,
}: {
  assignmentId: string;
  platforms: string[];
  onAllSubmitted: () => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(platformId: string) {
    const url = urls[platformId]?.trim();
    if (!url) { setError("Please paste your post link."); return; }

    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (platform && !platform.urlPattern.test(url)) {
      setError(`That doesn't look like a ${platform.name} link.`);
      return;
    }

    setLoading(platformId);
    setError("");
    try {
      const res = await fetch("/api/assignments/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, postUrl: url, platform: platformId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit.");
        return;
      }
      const newSubmitted = [...submitted, platformId];
      setSubmitted(newSubmitted);
      if (newSubmitted.length === platforms.length) {
        onAllSubmitted();
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  const remaining = platforms.filter((p) => !submitted.includes(p));
  if (remaining.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-gray-100 p-4">
      <h3 className="text-sm font-semibold mb-1">Submit your posts</h3>
      <p className="text-xs text-gray-500 mb-4">
        Add a link for each platform. Each generates its own HI score.
      </p>
      <div className="space-y-3">
        {platforms.map((platformId) => {
          const platform = PLATFORMS.find((p) => p.id === platformId);
          if (!platform) return null;
          const done = submitted.includes(platformId);

          return (
            <div key={platformId} className={`rounded-lg p-3 ${done ? "bg-emerald-50" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={done ? "text-emerald-600" : "text-gray-600"}>{platform.icon}</span>
                <span className="text-sm font-semibold">{platform.name}</span>
                {done && (
                  <span className="ml-auto text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Submitted
                  </span>
                )}
              </div>
              {!done && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder={platform.urlPlaceholder}
                    value={urls[platformId] ?? ""}
                    onChange={(e) => setUrls({ ...urls, [platformId]: e.target.value })}
                    className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-2.5 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmit(platformId)}
                    disabled={loading === platformId}
                    className="rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {loading === platformId ? "..." : "Submit"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
