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

export function emitNotificationsChanged(detail: { unread: number; id?: string }) {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail }));
}

export async function markNotificationRead(id: string): Promise<number | null> {
  try {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { unread: number };
    emitNotificationsChanged({ unread: data.unread, id });
    return data.unread;
  } catch {
    return null;
  }
}
