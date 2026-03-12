import { getBrandByUserId, getBrandBriefing } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { WhatsAppPreview } from "@/components/ui/whatsapp-preview";
import { BriefingForm } from "./briefing-form";
import { BriefingStatusToggle } from "./briefing-status-toggle";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function BriefingPage() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  const briefing = await getBrandBriefing(brand.id);

  if (!briefing) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Your Briefing</h1>
        <Card className="p-4">
          <BriefingForm />
        </Card>
      </div>
    );
  }

  const days = (briefing.availabilityDays as string[]) ?? [];
  const meals = (briefing.availabilityMeals as string[]) ?? [];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Briefing</h1>
        <div className="flex items-center gap-2">
          <BriefingStatusToggle briefingId={briefing.id} currentStatus={briefing.status} />
          <StatusBadge status={briefing.status} />
        </div>
      </div>

      {/* Content Brief */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Content Brief</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{briefing.contentBrief}</p>
      </Card>

      {/* Offer */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">What&apos;s Included</h2>
        {briefing.offerDescription ? (
          <p className="text-sm text-gray-700 leading-relaxed">{briefing.offerDescription}</p>
        ) : (
          <p className="text-sm text-gray-400">Payment only, no additional perks. Creators will see this when reviewing your collab.</p>
        )}
      </Card>

      {/* Availability */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Availability</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Days</p>
            <div className="flex flex-wrap gap-1.5">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                (day) => (
                  <span
                    key={day}
                    className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                      days.includes(day)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </span>
                )
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Meal times</p>
            <div className="flex flex-wrap gap-1.5">
              {["breakfast", "lunch", "dinner"].map((meal) => (
                <span
                  key={meal}
                  className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                    meals.includes(meal)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {meal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Briefing */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Edit Briefing</h2>
        <BriefingForm
          existing={{
            id: briefing.id,
            contentBrief: briefing.contentBrief,
            offerDescription: briefing.offerDescription ?? "",
            availabilityDays: days,
            availabilityMeals: meals,
            budgetHi: briefing.budgetHi,
          }}
        />
      </Card>

      {/* WhatsApp Preview */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">How creators receive your brief</h2>
        <WhatsAppPreview
          messages={[
            {
              from: "hyper",
              text: `Hi! You've been matched with ${brand.businessName}.\n\nBrief: ${briefing.contentBrief.slice(0, 80)}...\n\nReply YES to accept.`,
              time: "10:30 AM",
            },
            { from: "user", text: "YES", time: "10:32 AM" },
            {
              from: "hyper",
              text: "You're in! Pick a visit time and we'll confirm everything.",
              time: "10:32 AM",
            },
          ]}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Creators receive invitations and updates via WhatsApp
        </p>
      </Card>
    </div>
  );
}
