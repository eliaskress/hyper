import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unread") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const items = await getNotifications(userId, unreadOnly);
    return NextResponse.json({ notifications: items });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

const patchSchema = z.object({
  notificationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  markAll: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { notificationId, userId, markAll } = parsed.data;

    if (markAll && userId) {
      await markAllNotificationsRead(userId);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const updated = await markNotificationRead(notificationId);
      if (!updated) {
        return NextResponse.json(
          { error: "Notification not found", code: "NOT_FOUND" },
          { status: 404 },
        );
      }
      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json(
      { error: "Provide notificationId or userId with markAll", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
