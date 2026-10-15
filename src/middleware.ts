import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/api/auth/callback"];

// Routes only accessible by SUPER_ADMIN
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  // Refresh session and get user
  const { user, supabaseResponse } = await updateSession(request);

  // Not authenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check if profile is complete (user metadata)
  const profileComplete = user.user_metadata?.profile_complete;
  if (!profileComplete && pathname !== "/complete-profile") {
    const url = request.nextUrl.clone();
    url.pathname = "/complete-profile";
    return NextResponse.redirect(url);
  }

  // If profile is complete and trying to access complete-profile, redirect
  if (profileComplete && pathname === "/complete-profile") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Admin routes: check role from user metadata
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

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
