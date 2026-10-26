import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "~/lib/auth.config";
import {
  isTwoFactorCookieValid,
  twoFactorCookieName,
} from "~/lib/two-factor-cookie";
import { homePathForRole, isTeam, normalizeRole } from "~/lib/roles";

const { auth } = NextAuth(authConfig);

const twoFactorPath = "/login/two-factor";

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

  const totpRequired = !!req.auth?.totpRequired;
  const userId = req.auth?.user?.id;
  const twoFactorOk =
    userId &&
    isTwoFactorCookieValid(
      userId,
      req.cookies.get(twoFactorCookieName())?.value,
    );

  // Only `/login` — not `/login/two-factor` (founders verify 2FA there while signed in).
  if (pathname === "/login") {
    if (isLoggedIn) {
      return withPathname(
        NextResponse.redirect(new URL(homePathForRole(role), req.url)),
      );
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === twoFactorPath || pathname.startsWith(`${twoFactorPath}/`)) {
    if (!isLoggedIn) {
      return withPathname(NextResponse.redirect(new URL("/login", req.url)));
    }
    if (!totpRequired) {
      return withPathname(
        NextResponse.redirect(new URL(homePathForRole(role), req.url)),
      );
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return withPathname(NextResponse.redirect(login));
    }
    return withPathname(
      NextResponse.redirect(new URL(homePathForRole(role), req.url)),
    );
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
    if (totpRequired && !twoFactorOk) {
      const verify = new URL(twoFactorPath, req.url);
      verify.searchParams.set("callbackUrl", pathname);
      return withPathname(NextResponse.redirect(verify));
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
