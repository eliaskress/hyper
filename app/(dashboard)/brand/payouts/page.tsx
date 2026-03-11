import { Card } from "@/components/ui/card";

export default function BrandPayouts() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Payouts</h1>
        <p className="text-gray-400 text-sm">Track payments to creators.</p>
      </div>

      <Card className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 12h.01" />
            <path d="M2 10h20" />
          </svg>
        </div>
        <p className="font-medium text-gray-900 mb-1">Coming soon</p>
        <p className="text-sm text-gray-400">Payout tracking will be available here once Stripe is connected.</p>
      </Card>
    </div>
  );
}
