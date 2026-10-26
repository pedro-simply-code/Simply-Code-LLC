import "server-only";

import { headers } from "next/headers";
import { getClientIp } from "~/lib/client-ip";
import { db } from "~/server/db";
import { auditEvents } from "~/server/db/schema";

export type AuditLogInput = {
  actorUserId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  let ip: string | null = null;
  try {
    ip = getClientIp(await headers());
  } catch {
    ip = null;
  }

  try {
    await db.insert(auditEvents).values({
      actorUserId: input.actorUserId ?? null,
      action: input.action.slice(0, 120),
      entityType: input.entityType?.slice(0, 80),
      entityId: input.entityId,
      metadata: input.metadata ?? {},
      ipAddress: ip?.slice(0, 128) ?? null,
    });
  } catch (error) {
    console.error("[audit] Failed to write event", input.action, error);
  }
}
