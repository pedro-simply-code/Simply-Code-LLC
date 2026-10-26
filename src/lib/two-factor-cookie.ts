import { createHmac } from "node:crypto";
import { env } from "~/env";

const TWO_FACTOR_COOKIE = "sc_2fa";

export function twoFactorCookieName(): string {
  return TWO_FACTOR_COOKIE;
}

export function twoFactorCookieValue(userId: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(`2fa:${userId}`).digest("hex");
}

export function isTwoFactorCookieValid(userId: string, cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return cookieValue === twoFactorCookieValue(userId);
}
