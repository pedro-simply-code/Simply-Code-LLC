"use client";

import Link from "next/link";
import type { NotificationDTO } from "~/server/notifications/types";
import { appChip } from "~/lib/surface";
import { cn } from "~/lib/utils";

/** Shared size for type label + row actions on the notifications page. */
export const notificationRowControl = cn(
  "site-radius-md inline-flex h-9 min-w-[6.5rem] cursor-pointer items-center justify-center whitespace-nowrap px-3 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors",
);

/** Same default + hover as notification filter toolbar buttons. */
export const notificationRowActionButton = cn(
  notificationRowControl,
  "site-control bg-sc-section text-sc-ink hover:bg-sc-accent hover:text-white",
);

const rowTypeTag =
  "absolute top-0 right-0 z-[1] block rounded-none border-0 px-[15px] py-[7.5px] shadow-none bg-sc-accent/15 text-[9px] font-bold tracking-[0.1em] uppercase text-sc-ink";

const titleClass =
  "line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#15130f]";

const bodyClass = "line-clamp-2 min-h-[2.5rem] text-xs leading-snug text-[#57524a]";

export function NotificationRowContent({
  item,
  compact = false,
  showTypeChip = true,
}: {
  item: NotificationDTO;
  compact?: boolean;
  showTypeChip?: boolean;
}) {
  const title =
    item.groupCount > 1 ? `${item.title} (${item.groupCount})` : item.title;

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={cn(titleClass, compact && "min-h-0 line-clamp-2 text-sm")}>{title}</p>
        {showTypeChip ? (
          <span className={cn(appChip, "shrink-0 px-1.5 py-0.5 text-[9px] uppercase")}>
            {item.typeLabel}
          </span>
        ) : null}
      </div>
      {item.body ? (
        <p className={cn(bodyClass, "mt-1", compact && "min-h-0")}>{item.body}</p>
      ) : (
        <p className={cn(bodyClass, "mt-1", compact && "min-h-0")}>&nbsp;</p>
      )}
      {!compact && item.projectTitle ? (
        <p className="mt-1 line-clamp-1 text-[10px] text-[#6f6a60]">
          <span className="font-bold text-[#15130f]">Project:</span> {item.projectTitle}
        </p>
      ) : null}
      <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-[#9a9488] uppercase">
        {new Date(item.createdAt).toLocaleString()}
        {item.readAt ? " · read" : " · new"}
      </p>
    </>
  );
}

export function NotificationRow({
  item,
  onMarkRead,
  onOpen,
  compact,
}: {
  item: NotificationDTO;
  onMarkRead?: (id: string) => void;
  onOpen?: (event: React.MouseEvent, item: NotificationDTO) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex",
        compact
          ? "gap-2 border-b border-[#15130f]/8 px-4 py-3 last:border-0"
          : "relative items-end gap-4 overflow-hidden px-5 py-4",
        !item.readAt && !compact && "bg-[#fffaf0]",
        !item.readAt && compact && "bg-[#fffaf0]",
      )}
    >
      {!compact ? (
        <span className={rowTypeTag}>{item.typeLabel}</span>
      ) : null}
      <div className={cn("min-w-0 flex-1", !compact && "pr-28")}>
        {item.href && compact ? (
          <Link
            href={item.href}
            onClick={(event) => onOpen?.(event, item)}
            className="block transition-colors hover:text-sc-accent"
          >
            <NotificationRowContent item={item} compact={compact} />
          </Link>
        ) : item.href && !compact ? (
          <Link href={item.href} className="block transition-colors hover:text-sc-accent">
            <NotificationRowContent item={item} compact={compact} showTypeChip={false} />
          </Link>
        ) : (
          <NotificationRowContent
            item={item}
            compact={compact}
            showTypeChip={compact}
          />
        )}
      </div>
      {!compact ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {!item.readAt && onMarkRead ? (
            <button
              type="button"
              onClick={() => onMarkRead(item.id)}
              className={notificationRowActionButton}
            >
              Mark as read
            </button>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              onClick={(event) => onOpen?.(event, item)}
              className={notificationRowActionButton}
            >
              Open
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
