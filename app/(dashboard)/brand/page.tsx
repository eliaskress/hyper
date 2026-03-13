import { getBrandByUserId, getBrandStats, getBrandBriefing, getCurrentMonthHi, getAllTimeHi, getBriefingInfluenceSpread, getBrandCreatorSchedule, getBrandTrendScore } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiBudget } from "@/components/ui/hi-display";
import { WhatsAppIndicator } from "@/components/ui/whatsapp-preview";
import { HiBreakdown } from "./hi-breakdown";
import { BudgetEditor } from "./budget-editor";
import { PRICE_PER_HI } from "@/lib/hi";
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

      {/* Campaign Status - Budget > Spend > HI */}
      {briefing && await (async () => {
        const budgetHi = parseFloat(briefing.budgetHi);
        const spendingLimit = budgetHi * PRICE_PER_HI;
        const monthHi = await getCurrentMonthHi(briefing.id);
        const monthSpent = monthHi * PRICE_PER_HI;
        const allTimeHi = await getAllTimeHi(briefing.id);
        const allTimeSpent = allTimeHi * PRICE_PER_HI;
        const monthName = new Date().toLocaleDateString("en-US", { month: "long" });
        return (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Campaign Status</h2>
              <StatusBadge status={briefing.status} />
            </div>
            {/* Monthly budget */}
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500 mb-0.5">Monthly spending limit</p>
              <p className="text-2xl font-extrabold">${spendingLimit.toFixed(0)}<span className="text-sm font-semibold text-gray-400">/mo</span></p>
              <p className="text-xs text-gray-500 mt-0.5">
                ${monthSpent.toFixed(0)} spent in {monthName}
              </p>
              {/* ROI estimate */}
              {stats.engagement.reach > 0 && (
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-400">
                    Est. reach: {stats.engagement.reach.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Est. visits: {Math.round(stats.engagement.reach * 0.02).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <HiBudget
              budgetHi={briefing.budgetHi}
              hiDelivered={monthHi.toFixed(2)}
            />
            <p className="text-xs text-gray-400 text-center mt-1">Resets on the 1st of each month</p>
            {/* Total spend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Total spent (all time)</span>
              <span className="text-sm font-bold">${allTimeSpent.toFixed(0)}</span>
            </div>
            <BudgetEditor
              briefingId={briefing.id}
              currentBudgetHi={briefing.budgetHi}
            />
          </Card>
        );
      })()}

      {/* Influence Spread Card */}
      {briefing && await (async () => {
        const spread = await getBriefingInfluenceSpread(briefing.id);
        if (spread.creatorsPosted === 0) return null;
        return (
          <Card className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Influence Spread</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-extrabold">{spread.creatorsPosted}</p>
                <p className="text-xs text-gray-500">creators posted</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{spread.amplificationCount}</p>
                <p className="text-xs text-gray-500">amplifications</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{spread.secondaryCreators}</p>
                <p className="text-xs text-gray-500">secondary creators</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Your influence is spreading beyond your creators.
            </p>
          </Card>
        );
      })()}

      {/* Trend Score */}
      {await (async () => {
        const trend = await getBrandTrendScore(brand.id);
        return (
          <Card className="mb-6">
            <div className="flex items-center gap-2">
              {trend.isRising && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <path d="M7 17l5-5 4 4 6-8" />
                  <path d="M17 8h5v5" />
                </svg>
              )}
              <p className="text-sm font-semibold">{trend.trendLabel}</p>
            </div>
          </Card>
        );
      })()}

      {/* HI Delivered with engagement breakdown */}
      <HiBreakdown
        hiDelivered={parseFloat(stats.hiDelivered as string).toFixed(1)}
        engagement={stats.engagement}
      />

      {/* Creator Schedule */}
      {briefing && await (async () => {
        const schedule = await getBrandCreatorSchedule(briefing.id);
        if (schedule.length === 0) return null;
        return (
          <Card className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Creator Visits</h3>
            <div className="space-y-2">
              {schedule.map((visit, i) => {
                const d = visit.scheduledDate ? new Date(visit.scheduledDate) : null;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-gray-400 w-8 shrink-0">
                      {d ? d.toLocaleDateString("en-US", { weekday: "short" }) : "TBD"}
                    </span>
                    <span className="text-xs text-gray-600 w-14 shrink-0">
                      {d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                    </span>
                    <span className="font-medium">@{visit.creatorHandle}</span>
                    {visit.scheduleTimeStart && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {visit.scheduleTimeStart}{visit.scheduleTimeEnd ? ` - ${visit.scheduleTimeEnd}` : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

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
        <Link href="/brand/campaigns" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Campaigns</h3>
                <p className="text-xs text-gray-500 mt-0.5">See which creators drive the most impact</p>
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
