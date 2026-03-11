import { NextRequest, NextResponse } from "next/server";

const GATE_TOKEN = "hubster999";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== GATE_TOKEN) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("hyper-access", GATE_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
