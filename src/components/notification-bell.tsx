"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  NOTIFICATIONS_CHANGED_EVENT,
  type NotificationItem,
  emitNotificationsChanged,
  markNotificationRead,
} from "~/lib/notifications-client";

export function NotificationBell({
  viewAllHref = "/studio/notifications",
}: {
  viewAllHref?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: NotificationItem[]; unread: number };
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      // A transient polling failure should not break the studio shell.
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 10_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ unread: number; id?: string }>).detail;
      if (detail?.unread !== undefined) {
        setUnread(detail.unread);
      }
      if (detail?.id) {
        const readAt = new Date().toISOString();
        setItems((current) =>
          current.map((item) =>
            item.id === detail.id && !item.readAt ? { ...item, readAt } : item,
          ),
        );
      }
      void load();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
  }, [load]);

  const markAllRead = useCallback(async () => {
    setUnread(0);
    setItems((current) =>
      current.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() },
      ),
    );
    try {
      await fetch("/api/notifications", { method: "POST" });
      emitNotificationsChanged({ unread: 0 });
      await load();
    } catch {
      await load();
    }
  }, [load]);

  const markOneRead = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id);
      if (!target || target.readAt) return;

      const readAt = new Date().toISOString();
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt } : item)),
      );
      setUnread((count) => Math.max(0, count - 1));

      const nextUnread = await markNotificationRead(id);
      if (nextUnread !== null) {
        setUnread(nextUnread);
      } else {
        await load();
      }
    },
    [items, load],
  );

  const openNotification = useCallback(
    async (event: React.MouseEvent, item: NotificationItem) => {
      const href = item.href ?? viewAllHref;
      setOpen(false);

      if (item.readAt) return;

      event.preventDefault();
      await markOneRead(item.id);
      router.push(href);
    },
    [markOneRead, router, viewAllHref],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative inline-flex size-9 items-center justify-center border border-[#15130f]/15 bg-white text-[#15130f] transition-colors hover:border-[#f0a500]"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#e2761b] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 border border-[#15130f]/15 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#15130f]/10 px-4 py-3">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.1em] text-[#b8770a] uppercase hover:underline"
              >
                <CheckCheck className="size-3" /> Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-sm text-[#6f6a60]">No notifications yet.</li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="border-b border-[#15130f]/8 last:border-0">
                  <Link
                    href={item.href ?? viewAllHref}
                    onClick={(event) => void openNotification(event, item)}
                    className={`block px-4 py-3 hover:bg-[#f7f4ee] ${item.readAt ? "" : "bg-[#fffaf0]"}`}
                  >
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.body ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[#6f6a60]">{item.body}</p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-[#9a9488]">
                      {new Date(item.createdAt).toLocaleString()}
                      {item.readAt ? " · read" : " · new"}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block border-t border-[#15130f]/10 px-4 py-3 text-center text-[10px] font-bold tracking-[0.14em] uppercase hover:text-[#b8770a]"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
