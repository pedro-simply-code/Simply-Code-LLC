export {
  getNotificationFeed,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  notifyFounders,
  notifyProject,
  notifyProjectClients,
  notifyProjectRequest,
  notifyUsers,
  pruneOldNotifications,
  sendProjectEmail,
  withProjectEntity,
  type CreateNotificationInput,
  type NotificationDTO,
} from "~/server/notifications/index";

/** @deprecated Use `CreateNotificationInput` from `~/server/notifications`. */
export type NotificationInput =
  import("~/server/notifications/types").CreateNotificationInput;
