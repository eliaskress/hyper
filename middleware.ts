export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/campaigns/:path*", "/api/applications/:path*"],
};
