const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  applied: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  content_submitted: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colors = statusColors[status] ?? "bg-gray-100 text-gray-700";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${colors} ${className}`}
    >
      {label}
    </span>
  );
}
