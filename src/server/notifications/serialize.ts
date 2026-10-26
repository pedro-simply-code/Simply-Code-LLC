import { notificationTypeLabel } from "~/server/notifications/labels";
import type {
  NotificationDTO,
  NotificationRecord,
  NotificationType,
} from "~/server/notifications/types";

export function toNotificationDTO(
  row: NotificationRecord,
  groupCount = 1,
): NotificationDTO {
  const metadata = row.metadata ?? {};
  const type = row.type as NotificationType;

  return {
    id: row.id,
    type,
    typeLabel: notificationTypeLabel(row.type),
    title: row.title,
    body: row.body,
    href: row.href,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata,
    projectTitle: metadata.projectTitle ?? null,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    groupCount,
  };
}
