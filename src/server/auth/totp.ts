import "server-only";

import { randomBytes } from "node:crypto";
import { generateSecret, generateURI, verify } from "otplib";
import { env } from "~/env";

const ISSUER = env.NEXT_PUBLIC_APP_NAME;

export function createTotpSecret(): string {
  return generateSecret();
}

export function totpAuthUri(email: string, secret: string): string {
  return generateURI({
    issuer: ISSUER,
    label: email,
    secret,
  });
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const result = await verify({ secret, token: normalized });
  return result.valid;
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(4).toString("hex").toUpperCase(),
  );
}
