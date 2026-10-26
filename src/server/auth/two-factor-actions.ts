"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { logAuditEvent } from "~/server/audit/log";
import { twoFactorCookieName, twoFactorCookieValue } from "~/lib/two-factor-cookie";
import { createTotpSecret, totpAuthUri, verifyTotpCode } from "~/server/auth/totp";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export type TwoFactorSetupState = {
  secret: string;
  uri: string;
  email: string;
} | null;

export async function getTwoFactorSetup(): Promise<TwoFactorSetupState> {
  const session = await auth();
  if (!session?.user?.id || !isFounder(session.user.role)) return null;

  const [row] = await db
    .select({ email: users.email, totpEnabled: users.totpEnabled, totpSecret: users.totpSecret })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row?.email || row.totpEnabled) return null;

  const secret = row.totpSecret ?? createTotpSecret();
  if (!row.totpSecret) {
    await db
      .update(users)
      .set({ totpSecret: secret })
      .where(eq(users.id, session.user.id));
  }

  return { secret, uri: totpAuthUri(row.email, secret), email: row.email };
}

export async function enableTwoFactor(secret: string, code: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id || !isFounder(session.user.role)) {
    return { ok: false };
  }

  if (!(await verifyTotpCode(secret, code))) {
    return { ok: false };
  }

  await db
    .update(users)
    .set({ totpSecret: secret, totpEnabled: true })
    .where(eq(users.id, session.user.id));

  const cookieStore = await cookies();
  cookieStore.set(twoFactorCookieName(), twoFactorCookieValue(session.user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "security.2fa_enabled",
    entityType: "user",
    entityId: session.user.id,
  });

  return { ok: true };
}

export async function resetTwoFactorSetup(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id || !isFounder(session.user.role)) {
    return { ok: false };
  }

  const [row] = await db
    .select({ totpEnabled: users.totpEnabled })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (row?.totpEnabled) return { ok: false };

  await db
    .update(users)
    .set({ totpSecret: null })
    .where(eq(users.id, session.user.id));

  return { ok: true };
}

export async function disableTwoFactor(code: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id || !isFounder(session.user.role)) {
    return { ok: false };
  }

  const [row] = await db
    .select({ totpSecret: users.totpSecret })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row?.totpSecret || !(await verifyTotpCode(row.totpSecret, code))) {
    return { ok: false };
  }

  await db
    .update(users)
    .set({ totpSecret: null, totpEnabled: false })
    .where(eq(users.id, session.user.id));

  const cookieStore = await cookies();
  cookieStore.delete(twoFactorCookieName());

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "security.2fa_disabled",
    entityType: "user",
    entityId: session.user.id,
  });

  return { ok: true };
}

export async function verifyTwoFactorLogin(code: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [row] = await db
    .select({ totpSecret: users.totpSecret, totpEnabled: users.totpEnabled, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row?.totpEnabled || !row.totpSecret || !isFounder(row.role)) {
    redirect("/studio");
  }

  if (!(await verifyTotpCode(row.totpSecret, code))) {
    return { ok: false };
  }

  const cookieStore = await cookies();
  cookieStore.set(twoFactorCookieName(), twoFactorCookieValue(session.user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "security.2fa_verified",
    entityType: "user",
    entityId: session.user.id,
  });

  return { ok: true };
}

export async function clearTwoFactorCookieOnSignOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(twoFactorCookieName());
}
