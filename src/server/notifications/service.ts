import "server-only";

import type { NotificationContext } from "~/server/notifications/types";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  pruneOldNotifications,
} from "~/server/notifications/repository";

export async function getNotificationFeed(
  userId: string,
  options: {
    limit: number;
    cursor?: string;
    unreadOnly?: boolean;
    type?: string;
    entityId?: string;
    since?: string;
    context: NotificationContext;
  },
) {
  return listNotifications(userId, {
    limit: options.limit,
    cursor: options.cursor,
    unreadOnly: options.unreadOnly,
    type: options.type as
      import("~/server/notifications/types").NotificationType | undefined,
    entityId: options.entityId,
    since: options.since,
    context: options.context,
  });
}

export async function getUnreadNotificationCount(
  userId: string,
  context: NotificationContext = "studio",
) {
  return countUnreadNotifications(userId, context);
}

export async function getNotifications(userId: string, limit = 20) {
  const result = await listNotifications(userId, { limit, context: "studio" });
  return result.items;
}

export {
  markAllNotificationsRead as markAllNotificationsReadForUser,
  markNotificationRead as markNotificationReadForUser,
  pruneOldNotifications,
};
