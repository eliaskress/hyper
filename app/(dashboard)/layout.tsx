import { BottomNav } from "@/components/ui/bottom-nav";
import { NotificationHeader } from "@/components/ui/notification-header";
import { getCreatorAssignments } from "@/lib/db/queries";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let openCollabsCount = 0;
  try {
    const assignments = await getCreatorAssignments(DEMO_CREATOR_ID);
    openCollabsCount = assignments.filter((a) => a.status === "invited").length;
  } catch {
    // DB may not be available, default to 0
  }

  return (
    <div className="min-h-screen pb-24 bg-[#f8f9fb]">
      <NotificationHeader />
      <main className="max-w-lg mx-auto px-5 pt-6">{children}</main>
      <BottomNav openCollabsCount={openCollabsCount} />
    </div>
  );
}
