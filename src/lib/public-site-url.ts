import { env } from "~/env";

function isLocalhostHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function originFromUrlString(value: string, allowLocalhost: boolean): string | null {
  try {
    const parsed = new URL(value);
    if (!allowLocalhost && isLocalhostHostname(parsed.hostname)) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Canonical site origin for emails, invites, sitemap, etc.
 * Auth.js callbacks use AUTH_URL; public links must not prefer a dev AUTH_URL on Vercel.
 */
export function getPublicSiteOrigin(): string {
  const allowLocalhost = env.NODE_ENV !== "production";

  const fromPublic = originFromUrlString(env.NEXT_PUBLIC_SITE_URL, allowLocalhost);
  if (fromPublic) return fromPublic;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    const fromVercelProduction = originFromUrlString(
      productionHost.includes("://") ? productionHost : `https://${productionHost}`,
      false,
    );
    if (fromVercelProduction) return fromVercelProduction;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost && env.NODE_ENV === "production") {
    const fromVercel = originFromUrlString(`https://${vercelHost}`, false);
    if (fromVercel) return fromVercel;
  }

  if (env.AUTH_URL) {
    const fromAuth = originFromUrlString(env.AUTH_URL, allowLocalhost);
    if (fromAuth) return fromAuth;
  }

  return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
}

export function publicSiteUrl(
  pathname: string,
  searchParams?: Record<string, string>,
): string {
  const url = new URL(pathname, getPublicSiteOrigin());
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export function inviteAcceptUrl(token: string): string {
  return publicSiteUrl("/accept-invite", { token });
}
