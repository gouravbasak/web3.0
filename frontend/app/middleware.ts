// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect /admin routes. If adminToken cookie missing -> redirect to /admin/login
 * Note: this only checks presence of cookie (fast edge check). Backend should
 * still verify token signature for admin APIs.
 */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes (adjust matcher separately if needed)
  // Allow the login page and static assets
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/login/" // keep both forms safe
  ) {
    const adminToken = req.cookies.get("adminToken")?.value;

    if (!adminToken) {
      // not logged in — redirect to admin login
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname); // optional: returns user after login
      return NextResponse.redirect(loginUrl);
    }
  }

  // otherwise allow
  return NextResponse.next();
}

// configure matcher to only run for admin pages (faster)
export const config = {
  matcher: ["/admin/:path*"],
};
