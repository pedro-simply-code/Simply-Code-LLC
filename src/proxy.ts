import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "~/lib/auth.config";

const { auth } = NextAuth(authConfig);

const authPages = ["/login", "/register"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  // Signed-in users have no reason to see the auth screens.
  if (authPages.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }

    if (pathname.startsWith("/dashboard/admin")) {
      if (req.auth?.user?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
