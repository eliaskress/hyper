import { getBrandByUserId, getBrandStats, getBrandBriefing } from "@/lib/db/queries";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiBudget } from "@/components/ui/hi-display";
import { WhatsAppIndicator } from "@/components/ui/whatsapp-preview";
import { HiBreakdown } from "./hi-breakdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000010";

export default async function BrandDashboard() {
  const brand = await getBrandByUserId(DEMO_USER_ID);
  if (!brand) return <p className="p-6 text-gray-500">Brand not found.</p>;

  const stats = await getBrandStats(brand.id);
  const briefing = await getBrandBriefing(brand.id);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-400 mb-1">Campaign</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{brand.businessName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{brand.address}</p>
        <div className="mt-2">
          <WhatsAppIndicator connected={brand.whatsappConnected} />
        </div>
      </div>

      {/* Campaign Status */}
      {briefing && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Campaign Status</h2>
            <StatusBadge status={briefing.status} />
          </div>
          <HiBudget
            budgetHi={briefing.budgetHi}
            budgetType={briefing.budgetTypeField}
            hiDelivered={briefing.hiDelivered}
          />
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{briefing.contentBrief}</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Creators Matched" value={stats.creatorsMatched} />
        <StatCard label="HI Allocated" value={parseFloat(stats.hiAllocated).toFixed(1)} />
      </div>

      {/* HI Delivered with engagement breakdown */}
      <HiBreakdown
        hiDelivered={parseFloat(stats.hiDelivered as string).toFixed(1)}
        engagement={stats.engagement}
      />

      {/* Next Visit */}
      {stats.nextVisit && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Next Creator Visit</h3>
          <p className="text-sm text-gray-600">
            {new Date(stats.nextVisit).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </Card>
      )}

      {/* Quick Links */}
      <div className="flex flex-col gap-2">
        <Link href="/brand/briefing" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Your Briefing</h3>
                <p className="text-xs text-gray-500 mt-0.5">View and edit what creators should do</p>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </div>
          </Card>
        </Link>
        <Link href="/brand/creators" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Matched Creators</h3>
                <p className="text-xs text-gray-500 mt-0.5">See who Hyper assigned to your restaurant</p>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </div>
          </Card>
        </Link>
        <Link href="/brand/reports" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Reports</h3>
                <p className="text-xs text-gray-500 mt-0.5">HI results and campaign performance</p>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* WhatsApp Note */}
      <div className="bg-gray-50 rounded-xl p-4 text-center mt-6">
        <p className="text-xs text-gray-500">
          Reports are also delivered via WhatsApp.
          <br />
          Hyper handles creator matching, scheduling, and measurement.
        </p>
      </div>
    </div>
  );
}
