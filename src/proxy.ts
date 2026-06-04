import { NextResponse, type NextRequest } from "next/server";
import {
  verifySessionToken,
  createSessionToken,
  adminCookieOptions,
  ADMIN_COOKIE,
} from "@/lib/admin-auth";

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
      const res = NextResponse.redirect(url);
      // Drop any stale/expired cookie so the browser doesn't keep re-sending it.
      res.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
      return res;
    }
    // Sliding session: refresh the expiry on each active admin request.
    const res = NextResponse.next();
    res.cookies.set(ADMIN_COOKIE, createSessionToken(), adminCookieOptions);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
