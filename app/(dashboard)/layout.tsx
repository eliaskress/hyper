import { BottomNav } from "@/components/ui/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <main className="p-4">{children}</main>
      <BottomNav />
    </div>
  );
}
