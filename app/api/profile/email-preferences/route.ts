import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const schema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().nullable(),
  emailPreferences: z.object({
    newMatches: z.boolean(),
    expiringMatches: z.boolean(),
    dailyDigest: z.boolean(),
    paymentReceived: z.boolean(),
    creatorPosted: z.boolean(),
    hiMeasured: z.boolean(),
    weeklySummary: z.boolean(),
  }),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { userId, email, emailPreferences } = parsed.data;

    const [updated] = await db
      .update(users)
      .set({ email, emailPreferences })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, emailPreferences: users.emailPreferences });

    if (!updated) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
