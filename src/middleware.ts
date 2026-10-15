import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/api/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    try {
      const { supabaseResponse } = await updateSession(request);
      return supabaseResponse;
    } catch {
      return NextResponse.next();
    }
  }

  // 1. Check for Active Demo User Cookie
  const demoUserId = request.cookies.get("campus_connect_demo_user")?.value;
  const demoRole = request.cookies.get("campus_connect_demo_role")?.value;

  if (demoUserId) {
    // Admin routes protection: check role
    if (pathname.startsWith("/admin")) {
      if (demoRole !== "SUPER_ADMIN" && demoUserId !== "user-super-admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // 2. Try Supabase Auth
  try {
    const { user, supabaseResponse } = await updateSession(request);

    if (user) {
      const profileComplete = user.user_metadata?.profile_complete;
      if (!profileComplete && pathname !== "/complete-profile") {
        const url = request.nextUrl.clone();
        url.pathname = "/complete-profile";
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith("/admin")) {
        const role = user.user_metadata?.role;
        if (role !== "SUPER_ADMIN") {
          const url = request.nextUrl.clone();
          url.pathname = "/home";
          return NextResponse.redirect(url);
        }
      }

      return supabaseResponse;
    }
  } catch {
    // Supabase unavailable
  }

  // Fallback: If on protected route and no cookie/session, redirect to login
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
