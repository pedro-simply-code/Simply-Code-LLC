import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "~/env";

const COOKIE_BASE = "sc_2fa";
const COOKIE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type TwoFactorPayload = {
  /** User id the verification belongs to. */
  sub: string;
  /** Issued at (ms since epoch). */
  iat: number;
  /** Expires at (ms since epoch). */
  exp: number;
};

export function twoFactorCookieName(): string {
  // `__Host-` requires Secure + Path=/ + no Domain. Use it in production only,
  // otherwise the cookie cannot be set on plain-HTTP localhost.
  return process.env.NODE_ENV === "production"
    ? `__Host-${COOKIE_BASE}`
    : COOKIE_BASE;
}

function sign(payload: string): string {
  return createHmac("sha256", env.AUTH_SECRET)
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function twoFactorCookieValue(userId: string): string {
  const issuedAt = Date.now();
  const payload: TwoFactorPayload = {
    sub: userId,
    iat: issuedAt,
    exp: issuedAt + COOKIE_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function isTwoFactorCookieValid(
  userId: string,
  cookieValue: string | undefined,
): boolean {
  if (!cookieValue) return false;

  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0) return false;

  const encoded = cookieValue.slice(0, separator);
  const signature = cookieValue.slice(separator + 1);
  if (!encoded || !signature) return false;
  if (!safeEqual(signature, sign(encoded))) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<TwoFactorPayload>;
    return (
      parsed.sub === userId &&
      typeof parsed.iat === "number" &&
      typeof parsed.exp === "number" &&
      parsed.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function twoFactorCookieMaxAgeSeconds(): number {
  return Math.floor(COOKIE_TTL_MS / 1000);
}
