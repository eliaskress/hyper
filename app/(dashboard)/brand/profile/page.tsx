import { Card } from "@/components/ui/card";

export default function BrandProfile() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Profile</h1>
        <p className="text-gray-400 text-sm">Manage your business profile.</p>
      </div>

      <Card className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 10-16 0" />
          </svg>
        </div>
        <p className="font-medium text-gray-900 mb-1">Coming soon</p>
        <p className="text-sm text-gray-400">Business profile management is on the way.</p>
      </Card>
    </div>
  );
}
