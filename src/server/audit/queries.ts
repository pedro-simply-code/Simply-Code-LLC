import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { auditEvents, users } from "~/server/db/schema";

export async function getRecentAuditEvents(limit = 50) {
  return db
    .select({
      id: auditEvents.id,
      action: auditEvents.action,
      entityType: auditEvents.entityType,
      entityId: auditEvents.entityId,
      metadata: auditEvents.metadata,
      ipAddress: auditEvents.ipAddress,
      createdAt: auditEvents.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditEvents)
    .leftJoin(users, eq(users.id, auditEvents.actorUserId))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit);
}
