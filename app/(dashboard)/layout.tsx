import { BottomNav } from "@/components/ui/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24 bg-[#f8f9fb]">
      <main className="max-w-lg mx-auto px-5 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
