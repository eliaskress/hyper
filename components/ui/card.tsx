interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        accent
          ? "bg-black text-white"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${accent ? "text-gray-400" : "text-gray-400"}`}>
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
