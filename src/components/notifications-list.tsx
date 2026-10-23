"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  type NotificationItem,
  markNotificationRead,
} from "~/lib/notifications-client";

function serializeItem(item: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}): NotificationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    href: item.href,
    readAt: item.readAt
      ? typeof item.readAt === "string"
        ? item.readAt
        : item.readAt.toISOString()
      : null,
    createdAt:
      typeof item.createdAt === "string"
        ? item.createdAt
        : item.createdAt.toISOString(),
  };
}

export function NotificationsList({
  initialItems,
}: {
  initialItems: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    href: string | null;
    readAt: Date | string | null;
    createdAt: Date | string;
  }>;
}) {
  const router = useRouter();
  const [items, setItems] = useState(() => initialItems.map(serializeItem));

  const markRead = useCallback(async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.readAt) return;

    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, readAt } : item)),
    );
    await markNotificationRead(id);
  }, [items]);

  const openNotification = useCallback(
    async (event: React.MouseEvent, item: NotificationItem) => {
      if (!item.href || item.readAt) return;

      event.preventDefault();
      await markRead(item.id);
      router.push(item.href);
    },
    [markRead, router],
  );

  if (items.length === 0) {
    return (
      <div className="border border-[#15130f]/12 bg-white">
        <p className="px-5 py-10 text-sm text-[#6f6a60]">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-[#15130f]/12 bg-white">
      <ul className="divide-y divide-[#15130f]/10">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.readAt ? "px-5 py-4" : "bg-[#fffaf0] px-5 py-4"}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => void markRead(item.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-[#57524a]">
                    {item.body}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
                  {item.type} · {new Date(item.createdAt).toLocaleString()}
                  {item.readAt ? " · read" : " · unread"}
                </p>
              </button>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={(event) => void openNotification(event, item)}
                  className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                >
                  Open
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => void markRead(item.id)}
                  className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
