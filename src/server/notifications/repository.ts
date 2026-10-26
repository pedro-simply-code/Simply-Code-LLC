import "server-only";

import { and, count, desc, eq, gt, inArray, isNull, lt, or } from "drizzle-orm";
import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";
import { groupNotificationsByEntity } from "~/server/notifications/labels";
import { allowedNotificationTypes } from "~/server/notifications/policies";
import { toNotificationDTO } from "~/server/notifications/serialize";
import type {
  CreateNotificationInput,
  ListNotificationsOptions,
  ListNotificationsResult,
  NotificationRecord,
} from "~/server/notifications/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapRow(row: typeof notifications.$inferSelect): NotificationRecord {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata: row.metadata ?? {},
    dedupeKey: row.dedupeKey,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

function buildListConditions(
  userId: string,
  options: ListNotificationsOptions,
) {
  const types = allowedNotificationTypes(options.context);
  const conditions = [
    eq(notifications.userId, userId),
    inArray(notifications.type, [...types]),
  ];

  if (options.unreadOnly) {
    conditions.push(isNull(notifications.readAt));
  }
  if (options.type) {
    conditions.push(eq(notifications.type, options.type));
  }
  if (options.entityId && UUID.test(options.entityId)) {
    conditions.push(eq(notifications.entityId, options.entityId));
  }
  if (options.since) {
    const since = new Date(options.since);
    if (!Number.isNaN(since.getTime())) {
      conditions.push(gt(notifications.createdAt, since));
    }
  }
  if (options.cursor) {
    const cursorDate = new Date(options.cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      conditions.push(lt(notifications.createdAt, cursorDate));
    }
  }

  return and(...conditions);
}

export async function countUnreadNotifications(
  userId: string,
  context: ListNotificationsOptions["context"],
) {
  const types = allowedNotificationTypes(context);
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
        inArray(notifications.type, [...types]),
      ),
    );
  return Number(row?.value ?? 0);
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions,
): Promise<ListNotificationsResult> {
  const limit = Math.min(Math.max(options.limit, 1), 100);
  const rows = await db
    .select()
    .from(notifications)
    .where(buildListConditions(userId, options))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const mapped = slice.map(mapRow);
  const grouped = groupNotificationsByEntity(mapped);
  const items = grouped.map((row) => toNotificationDTO(row, row.groupCount));
  const unread = await countUnreadNotifications(userId, options.context);
  const last = slice[slice.length - 1];

  return {
    items,
    unread,
    nextCursor: hasMore && last ? last.createdAt.toISOString() : null,
  };
}

export async function insertNotificationsForUsers(
  userIds: string[],
  input: CreateNotificationInput,
) {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return;

  const values = unique.map((userId) => ({
    userId,
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    href: input.href,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
    dedupeKey: input.dedupeKey,
  }));

  if (input.dedupeKey) {
    await db
      .insert(notifications)
      .values(values)
      .onConflictDoNothing({
        target: [notifications.userId, notifications.dedupeKey],
      });
    return;
  }

  await db.insert(notifications).values(values);
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  if (!UUID.test(notificationId)) return false;

  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id });

  return updated.length > 0;
}

/** @deprecated Use listNotifications — kept for legacy call sites. */
export async function listNotificationsLegacy(userId: string, limit = 20) {
  const result = await listNotifications(userId, {
    limit,
    context: "studio",
  });
  return result.items;
}

export async function pruneOldNotifications(olderThanDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const deleted = await db
    .delete(notifications)
    .where(
      and(
        lt(notifications.createdAt, cutoff),
        or(isNull(notifications.readAt), lt(notifications.readAt, cutoff)),
      ),
    )
    .returning({ id: notifications.id });

  return deleted.length;
}
