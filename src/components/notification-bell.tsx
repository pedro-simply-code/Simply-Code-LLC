"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationRowContent } from "~/components/notifications/notification-row";
import { useNotificationsBell } from "~/hooks/use-notifications";
import type { NotificationContext } from "~/lib/notifications-api";
import type { NotificationDTO } from "~/server/notifications/types";
import { appDropdown, appIconButton } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function NotificationBell({
  context = "studio",
  viewAllHref = "/studio/notifications",
}: {
  context?: NotificationContext;
  viewAllHref?: string;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const feed = useNotificationsBell(context);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const openNotification = useCallback(
    async (event: React.MouseEvent, item: NotificationDTO) => {
      const href = item.href ?? viewAllHref;
      setOpen(false);

      if (item.readAt) return;

      event.preventDefault();
      await feed.markRead.mutateAsync(item.id);
      router.push(href);
    },
    [feed.markRead, router, viewAllHref],
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(appIconButton, "relative size-9")}
      >
        <Bell className="size-4" />
        {feed.unread > 0 ? (
          <span
            className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#e2761b] px-1 text-[10px] font-bold text-white"
            aria-live="polite"
          >
            {feed.unread > 9 ? "9+" : feed.unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className={cn(appDropdown, "absolute right-0 z-50 mt-2 w-80 overflow-hidden")}
        >
          <div className="px-4 py-3 shadow-[0_1px_0_rgba(21,19,15,0.06)]">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase">Notifications</p>
          </div>
          <ul className="max-h-80 overflow-auto" aria-live="polite">
            {feed.isLoading ? (
              <li className="px-4 py-6 text-sm text-[#6f6a60]">Loading…</li>
            ) : feed.isError ? (
              <li className="px-4 py-6 text-sm text-[#9a3b2e]">
                Failed to load.{" "}
                <button type="button" className="underline" onClick={() => void feed.refetch()}>
                  Retry
                </button>
              </li>
            ) : feed.items.length === 0 ? (
              <li className="px-4 py-6 text-sm text-[#6f6a60]">No notifications yet.</li>
            ) : (
              feed.items.map((item) => (
                <li
                  key={item.id}
                  className={`border-b border-[#15130f]/8 last:border-0 ${item.readAt ? "" : "bg-[#fffaf0]"}`}
                >
                  <Link
                    href={item.href ?? viewAllHref}
                    onClick={(event) => void openNotification(event, item)}
                    className="block px-4 py-3 hover:bg-sc-section-alt"
                  >
                    <NotificationRowContent item={item} compact />
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block border-t border-[#15130f]/10 px-4 py-3 text-center text-[10px] font-bold tracking-[0.14em] uppercase hover:text-sc-accent"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
