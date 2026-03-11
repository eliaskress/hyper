import { NextRequest, NextResponse } from "next/server";

const GATE_COOKIE = "hyper-access";
const GATE_TOKEN = "hubster999";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the gate page and gate API through
  if (pathname === "/gate" || pathname === "/api/gate") {
    return NextResponse.next();
  }

  // Allow static assets / Next internals through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg")
  ) {
    return NextResponse.next();
  }

  // Check for access cookie
  const cookie = request.cookies.get(GATE_COOKIE);
  if (cookie?.value === GATE_TOKEN) {
    return NextResponse.next();
  }

  // Redirect to gate
  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = "/gate";
  return NextResponse.redirect(gateUrl);
}
