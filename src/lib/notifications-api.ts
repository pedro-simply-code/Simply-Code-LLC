import type { NotificationDTO } from "~/server/notifications/types";

export type NotificationContext = "studio" | "portal";

export type NotificationsFeedResponse = {
  items: NotificationDTO[];
  unread: number;
  nextCursor: string | null;
};

export type NotificationsQueryParams = {
  context: NotificationContext;
  limit?: number;
  cursor?: string;
  unreadOnly?: boolean;
  type?: string;
  entityId?: string;
  since?: string;
};

export function notificationsQueryKey(params: NotificationsQueryParams) {
  return [
    "notifications",
    params.context,
    params.limit ?? 20,
    params.cursor ?? "",
    params.unreadOnly ? "unread" : "all",
    params.type ?? "",
    params.entityId ?? "",
    params.since ?? "",
  ];
}

export async function fetchNotifications(
  params: NotificationsQueryParams,
): Promise<NotificationsFeedResponse> {
  const search = new URLSearchParams();
  search.set("context", params.context);
  search.set("limit", String(params.limit ?? 20));
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.unreadOnly) search.set("filter", "unread");
  if (params.type) search.set("type", params.type);
  if (params.entityId) search.set("entityId", params.entityId);
  if (params.since) search.set("since", params.since);

  const res = await fetch(`/api/notifications?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }
  return (await res.json()) as NotificationsFeedResponse;
}

export async function markAllNotificationsReadApi() {
  const res = await fetch("/api/notifications", { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark all read");
}

export async function markNotificationReadApi(id: string): Promise<number> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
    keepalive: true,
  });
  if (!res.ok) throw new Error("Failed to mark read");
  const data = (await res.json()) as { unread: number };
  return data.unread;
}
