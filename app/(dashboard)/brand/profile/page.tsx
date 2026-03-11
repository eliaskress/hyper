import { getBrandByUserId } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { WhatsAppIndicator } from "@/components/ui/whatsapp-preview";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function BrandProfile() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Profile</h1>
        <p className="text-gray-400 text-sm">Manage your business profile.</p>
      </div>

      {/* Business Info */}
      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-bold text-gray-500">
            {brand.businessName.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold">{brand.businessName}</p>
            <p className="text-sm text-gray-500">{brand.address}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
          <InfoRow label="Verified" value={brand.verified ? "Yes" : "Pending"} />
          <InfoRow label="Member since" value={new Date(brand.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
        </div>
      </Card>

      {/* WhatsApp Connection */}
      <Card className="mb-4">
        <h2 className="font-bold mb-3">WhatsApp</h2>
        <WhatsAppIndicator connected={brand.whatsappConnected} />
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {brand.whatsappConnected
            ? "You'll receive weekly campaign reports and creator updates via WhatsApp."
            : "Connect WhatsApp to receive campaign reports and real-time updates from Hyper."}
        </p>
        {!brand.whatsappConnected && (
          <button className="w-full mt-4 rounded-xl bg-[#25D366] text-white py-3.5 font-semibold text-sm hover:bg-[#20bd5a] active:scale-[0.98] transition-all min-h-[44px]">
            Connect WhatsApp
          </button>
        )}
      </Card>

      {/* Stripe */}
      <Card>
        <h2 className="font-bold mb-3">Payment Method</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${brand.stripeAccountId ? "bg-emerald-500" : "bg-gray-300"}`} />
          <p className="font-semibold">{brand.stripeAccountId ? "Stripe Connected" : "Not connected"}</p>
        </div>
        {!brand.stripeAccountId && (
          <>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Connect Stripe to fund your influence budget. Hyper uses Stripe for secure payments.
            </p>
            <button className="w-full rounded-xl bg-black text-white py-3.5 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10 min-h-[44px]">
              Connect Stripe
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
