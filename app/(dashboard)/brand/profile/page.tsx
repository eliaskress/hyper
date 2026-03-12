import { getBrandByUserId } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { WhatsAppIndicator } from "@/components/ui/whatsapp-preview";
import { BrandProfileEdit } from "./profile-edit";
import { BrandInfoEdit } from "./brand-info-edit";

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
        <BrandInfoEdit
          brandId={brand.id}
          currentName={brand.businessName}
          currentAddress={brand.address ?? ""}
          verified={brand.verified}
          createdAt={brand.createdAt.toISOString()}
        />
      </Card>

      {/* Instagram */}
      <Card className="mb-4">
        <h2 className="font-bold mb-3">Instagram</h2>
        <BrandProfileEdit brandId={brand.id} currentHandle={brand.instagramHandle ?? ""} />
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

      {/* Payment Method */}
      <Card>
        <h2 className="font-bold mb-3">Payment Method</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${brand.stripeAccountId ? "bg-emerald-500" : "bg-gray-300"}`} />
          <p className="font-semibold">{brand.stripeAccountId ? "Card on file" : "No card added"}</p>
        </div>
        {brand.stripeAccountId ? (
          <div>
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-r from-gray-800 to-gray-600 rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold tracking-wider">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium">&bull;&bull;&bull;&bull; 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/27</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              You&apos;re billed monthly based on the HI your creators generate, up to your spending limit. Limit resets on the 1st. You only pay for real engagement.
            </p>
            <button className="w-full rounded-xl border-2 border-gray-200 py-3.5 font-semibold text-sm hover:bg-gray-50 transition-all min-h-[44px]">
              Update Card
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Add a card to activate your campaign. You&apos;re billed monthly based on real engagement, up to your spending limit. Resets on the 1st.
            </p>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Works like Instagram ads. Add a card, set a monthly budget, Hyper handles billing. No commitments, cancel anytime.
            </p>
            <button className="w-full rounded-xl bg-black text-white py-3.5 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10 min-h-[44px]">
              Add Payment Method
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
