import { NextResponse } from "next/server";
import { calculateCreatorReturnRate } from "@/lib/metrics";

// TODO: Replace with real admin auth check (session, JWT, or role-based)
function isAdmin(): boolean {
  return true;
}

export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const result = await calculateCreatorReturnRate();

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
