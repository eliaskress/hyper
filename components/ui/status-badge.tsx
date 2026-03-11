const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  active: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  in_review: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  applied: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  accepted: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  content_submitted: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${config.bg} ${config.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
