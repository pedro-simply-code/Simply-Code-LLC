import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "~/lib/auth.config";
import { homePathForRole, isTeam, normalizeRole } from "~/lib/roles";

const { auth } = NextAuth(authConfig);

const authPages = ["/login"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = normalizeRole(req.auth?.user?.role);

  // Public registration is disabled. Invitees use the emailed link instead.
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Signed-in users do not need the auth screens.
  if (authPages.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(homePathForRole(role), req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.redirect(new URL(homePathForRole(role), req.url));
  }

  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (!isTeam(role)) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (isTeam(role)) {
      return NextResponse.redirect(new URL("/studio", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/studio/:path*",
    "/portal/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
