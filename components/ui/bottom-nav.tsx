"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const brandTabs = [
  { href: "/brand", label: "Home", icon: "🏠" },
  { href: "/brand/campaigns", label: "Campaigns", icon: "📋" },
  { href: "/brand/applications", label: "Applications", icon: "📥" },
  { href: "/brand/payouts", label: "Payouts", icon: "💰" },
  { href: "/brand/profile", label: "Profile", icon: "👤" },
];

const influencerTabs = [
  { href: "/influencer", label: "Home", icon: "🏠" },
  { href: "/influencer/browse", label: "Browse", icon: "🔍" },
  { href: "/influencer/applications", label: "Applied", icon: "📋" },
  { href: "/influencer/earnings", label: "Earnings", icon: "💰" },
  { href: "/influencer/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isBrand = pathname.startsWith("/brand");
  const tabs = isBrand ? brandTabs : influencerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== (isBrand ? "/brand" : "/influencer") && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-1 text-xs ${
                isActive ? "text-black font-medium" : "text-gray-500"
              }`}
            >
              <span className="text-lg mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
