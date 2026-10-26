"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { getClientIp } from "~/lib/client-ip";
import { eq } from "drizzle-orm";
import { signIn } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { loginSchema, type LoginInput } from "~/schemas/auth";
import { consumeRateLimit } from "~/server/rate-limit";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const LOGIN_IP_LIMIT = 25;
const LOGIN_EMAIL_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export type CredentialsSignInResult =
  | { ok: true; needs2fa?: boolean }
  | { ok: false; error: "invalid" | "rate_limited" };

export async function credentialsSignIn(
  input: LoginInput,
): Promise<CredentialsSignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const email = parsed.data.email.toLowerCase();
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const ipAllowed = await consumeRateLimit(
    `login:ip:${ip}`,
    LOGIN_IP_LIMIT,
    LOGIN_WINDOW_MS,
  );
  const emailAllowed = await consumeRateLimit(
    `login:email:${email}`,
    LOGIN_EMAIL_LIMIT,
    LOGIN_WINDOW_MS,
  );

  if (!ipAllowed || !emailAllowed) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });

    const [row] = await db
      .select({ role: users.role, totpEnabled: users.totpEnabled })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const needs2fa = !!row && isFounder(row.role) && row.totpEnabled;
    return { ok: true, needs2fa };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalid" };
    }
    throw error;
  }
}
