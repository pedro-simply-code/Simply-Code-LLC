import type { NotificationContext, NotificationType } from "~/server/notifications/types";
import { NOTIFICATION_TYPES } from "~/server/notifications/types";

/** Portal users do not receive internal contact-form notifications. */
export function allowedNotificationTypes(
  context: NotificationContext,
): readonly NotificationType[] {
  if (context === "portal") {
    return NOTIFICATION_TYPES.filter((type) => type !== "contact");
  }
  return NOTIFICATION_TYPES;
}

export function isNotificationTypeAllowed(
  type: string,
  context: NotificationContext,
): type is NotificationType {
  return (allowedNotificationTypes(context) as readonly string[]).includes(type);
}
