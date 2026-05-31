import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth";

/**
 * Guards the admin area. This is an optimistic check at the edge of
 * routing; the admin pages also re-verify the session before reading data.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!verifySessionToken(token)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
