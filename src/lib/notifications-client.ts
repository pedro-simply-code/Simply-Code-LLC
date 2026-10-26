export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export function emitNotificationsChanged(detail: {
  unread: number;
  id?: string;
}) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail }),
  );
}

export async function markNotificationRead(id: string): Promise<number | null> {
  try {
    const { markNotificationReadApi } = await import("~/lib/notifications-api");
    const unread = await markNotificationReadApi(id);
    emitNotificationsChanged({ unread, id });
    return unread;
  } catch {
    return null;
  }
}
