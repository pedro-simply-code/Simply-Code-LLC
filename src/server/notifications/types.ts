export const NOTIFICATION_TYPES = [
  "contact",
  "project",
  "review",
  "request",
  "message",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationContext = "studio" | "portal";

export type NotificationMetadata = Record<string, string>;

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  entityType?: string;
  entityId?: string;
  metadata?: NotificationMetadata;
  dedupeKey?: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: NotificationMetadata | null;
  dedupeKey: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  typeLabel: string;
  title: string;
  body: string;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: NotificationMetadata;
  projectTitle: string | null;
  readAt: string | null;
  createdAt: string;
  groupCount: number;
};

export type ListNotificationsOptions = {
  limit: number;
  cursor?: string;
  unreadOnly?: boolean;
  type?: NotificationType;
  entityId?: string;
  since?: string;
  context: NotificationContext;
};

export type ListNotificationsResult = {
  items: NotificationDTO[];
  unread: number;
  nextCursor: string | null;
};
