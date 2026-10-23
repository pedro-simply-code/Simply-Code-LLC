/** Marketing URLs that maintenance mode should replace (not studio/portal/auth). */
export function isPublicMarketingPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/studio")) return false;
  if (pathname.startsWith("/portal")) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/register")) return false;
  if (pathname.startsWith("/accept-invite")) return false;
  if (pathname.startsWith("/api")) return false;

  const publicPrefixes = [
    "/work",
    "/about",
    "/contact",
    "/services",
    "/faq",
    "/privacy",
    "/terms",
  ];

  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
