import { PRICE_PER_HI, REVENUE_SPLIT } from "@/lib/hi";

/** Displays HI units with dollar conversion */
export function HiDisplay({
  hi,
  showBreakdown = false,
  size = "md",
}: {
  hi: number | string;
  showBreakdown?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const hiNum = typeof hi === "string" ? parseFloat(hi) : hi;
  const grossUsd = hiNum * PRICE_PER_HI;
  const creatorUsd = grossUsd * (REVENUE_SPLIT.creator / 100);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-semibold",
  };

  return (
    <div className={sizeClasses[size]}>
      <span className="font-semibold">{hiNum.toFixed(1)} HI</span>
      {showBreakdown && (
        <div className="text-xs text-gray-500 mt-0.5">
          {hiNum.toFixed(1)} HI × ${PRICE_PER_HI}/HI = ${grossUsd.toFixed(2)} total
          <br />
          Creator share (40%): <span className="text-black font-medium">${creatorUsd.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

/** Inline HI amount with creator earnings */
export function HiEarnings({ hi, className = "" }: { hi: number | string; className?: string }) {
  const hiNum = typeof hi === "string" ? parseFloat(hi) : hi;
  const creatorUsd = hiNum * PRICE_PER_HI * (REVENUE_SPLIT.creator / 100);

  return (
    <span className={className}>
      <span className="font-semibold">${creatorUsd.toFixed(2)}</span>
      <span className="text-gray-500 text-xs ml-1">({hiNum.toFixed(1)} HI)</span>
    </span>
  );
}

/** Budget display for restaurants */
export function HiBudget({
  budgetHi,
  budgetType,
  hiDelivered,
}: {
  budgetHi: number | string;
  budgetType: string;
  hiDelivered: number | string;
}) {
  const budget = typeof budgetHi === "string" ? parseFloat(budgetHi) : budgetHi;
  const delivered = typeof hiDelivered === "string" ? parseFloat(hiDelivered) : hiDelivered;
  const totalUsd = budget * PRICE_PER_HI;
  const percent = budget > 0 ? Math.min((delivered / budget) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium">
          {delivered.toFixed(1)} / {budget.toFixed(0)} HI
        </span>
        <span className="text-xs text-gray-500">
          ${totalUsd.toFixed(0)} {budgetType === "monthly" ? "/mo" : "total"}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
