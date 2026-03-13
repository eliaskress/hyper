export const dynamic = "force-dynamic";

import { getNotifications } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { MarkAllReadButton } from "./mark-all-read-button";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

const typeIcons: Record<string, string> = {
  new_opportunity: "🟢",
  amplification_received: "⚡",
  milestone: "🏆",
  payout_ready: "💰",
  campaign_update: "📊",
  rank_change: "📈",
};

export default async function NotificationsPage() {
  const items = await getNotifications(DEMO_CREATOR_ID);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.filter((n) => !n.read).length} unread
          </p>
        </div>
        {items.some((n) => !n.read) && (
          <MarkAllReadButton userId={DEMO_CREATOR_ID} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((notification) => (
          <Card
            key={notification.id}
            className={`${!notification.read ? "border-l-4 border-l-black bg-white" : "bg-gray-50/80"}`}
          >
            <div className="flex gap-3">
              <span className="text-lg shrink-0" role="img" aria-hidden="true">
                {typeIcons[notification.type] ?? "📌"}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1.5" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No notifications</p>
          <p className="text-sm text-gray-400">
            You will see updates about amplifications, campaigns, and payouts here.
          </p>
        </Card>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
