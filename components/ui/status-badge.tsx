const statusConfig: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  // Briefing statuses
  draft: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  active: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  paused: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },

  // Assignment statuses
  invited: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "matched" },
  accepted: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  scheduled: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  posted: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  measured: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  declined: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },

  // Payout statuses
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
  const label = config.label ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${config.bg} ${config.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
