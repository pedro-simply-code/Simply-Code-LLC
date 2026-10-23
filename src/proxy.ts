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
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const withPathname = (response: NextResponse) => {
    response.headers.set("x-pathname", pathname);
    return response;
  };

  // Public registration is disabled. Invitees use the emailed link instead.
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return withPathname(NextResponse.redirect(new URL("/login", req.url)));
  }

  // Signed-in users do not need the auth screens.
  if (authPages.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn) {
      return withPathname(NextResponse.redirect(new URL(homePathForRole(role), req.url)));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return withPathname(NextResponse.redirect(login));
    }
    return withPathname(NextResponse.redirect(new URL(homePathForRole(role), req.url)));
  }

  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return withPathname(NextResponse.redirect(login));
    }
    if (!isTeam(role)) {
      return withPathname(NextResponse.redirect(new URL("/portal", req.url)));
    }
  }

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return withPathname(NextResponse.redirect(login));
    }
    if (isTeam(role)) {
      return withPathname(NextResponse.redirect(new URL("/studio", req.url)));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
