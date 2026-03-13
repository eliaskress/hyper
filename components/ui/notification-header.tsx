import { getUnreadNotificationCount } from "@/lib/db/queries";
import { NotificationBell } from "./notification-bell";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export async function NotificationHeader() {
  let unreadCount = 0;
  try {
    unreadCount = await getUnreadNotificationCount(DEMO_CREATOR_ID);
  } catch {
    // Silently fail if DB is unavailable
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-3 flex justify-end">
      <NotificationBell unreadCount={unreadCount} />
    </div>
  );
}
