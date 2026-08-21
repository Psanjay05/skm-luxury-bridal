/**
 * Next.js 16 Proxy (Middleware) — Admin Route Protection
 *
 * In Next.js 16, this proxy.ts file acts as edge middleware.
 * It protects:
 *   - /admin/* pages (except /admin/login)
 *   - /api/admin/* API routes (all require authentication)
 *
 * Individual API handlers also check auth() as a defense-in-depth measure.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and NextAuth internal routes to pass through
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // Protect all /admin/* pages and /api/admin/* API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = await auth();

    if (!session) {
      // Return 401 JSON for API routes; redirect to login for page routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
