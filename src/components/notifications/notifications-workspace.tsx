"use client";

import { useRouter } from "next/navigation";
import {
  NotificationRow,
  notificationRowActionButton,
} from "~/components/notifications/notification-row";
import { StudioHeader } from "~/components/studio/ui";
import { useNotificationsWorkspace } from "~/hooks/use-notifications";
import type { NotificationContext } from "~/lib/notifications-api";
import { notificationTypeLabel } from "~/server/notifications/labels";
import { NOTIFICATION_TYPES } from "~/server/notifications/types";
import { appAccentButtonLg, appGhostButtonLg, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";
import type { NotificationDTO } from "~/server/notifications/types";

const filterToolbarButton = notificationRowActionButton;

const filterToolbarButtonActive =
  "bg-sc-accent text-white hover:bg-sc-accent hover:text-white";

const filterTypeButton = cn(filterToolbarButton, "min-w-[5.5rem]");

export function NotificationsWorkspace({
  context,
  title = "Notifications",
  description,
  entityId,
  initialType,
}: {
  context: NotificationContext;
  title?: string;
  description: string;
  entityId?: string;
  initialType?: string;
}) {
  const router = useRouter();
  const feed = useNotificationsWorkspace(context, {
    entityId,
    type: initialType,
  });

  const markRead = (id: string) => {
    void feed.markRead.mutate(id);
  };

  const openNotification = async (event: React.MouseEvent, item: NotificationDTO) => {
    if (!item.href) return;
    event.preventDefault();
    if (!item.readAt) {
      await feed.markRead.mutateAsync(item.id);
    }
    router.push(item.href);
  };

  const selectAllFilter = () => {
    feed.setUnreadOnly(false);
    feed.setTypeFilter("");
  };

  const selectUnreadFilter = () => {
    feed.setUnreadOnly(true);
    feed.setTypeFilter("");
  };

  const selectTypeFilter = (type: string) => {
    if (feed.typeFilter === type) {
      selectAllFilter();
      return;
    }
    feed.setUnreadOnly(false);
    feed.setTypeFilter(type);
  };

  const allFilterActive = !feed.unreadOnly && !feed.typeFilter;
  const unreadFilterActive = feed.unreadOnly && !feed.typeFilter;

  return (
    <div>
      <StudioHeader
        title={title}
        description={description}
        actions={
          feed.unread > 0 ? (
            <button
              type="button"
              disabled={feed.markAllRead.isPending}
              onClick={() => void feed.markAllRead.mutate()}
              className={cn(
                appAccentButtonLg,
                "inline-flex h-9 items-center justify-center",
              )}
            >
              Mark all read ({feed.unread})
            </button>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={selectAllFilter}
          className={cn(filterToolbarButton, allFilterActive && filterToolbarButtonActive)}
        >
          All
        </button>
        <button
          type="button"
          onClick={selectUnreadFilter}
          className={cn(filterToolbarButton, unreadFilterActive && filterToolbarButtonActive)}
        >
          Unread
        </button>
        {NOTIFICATION_TYPES.filter((type) => context === "studio" || type !== "contact").map(
          (type) => (
            <button
              key={type}
              type="button"
              onClick={() => selectTypeFilter(type)}
              className={cn(
                filterTypeButton,
                feed.typeFilter === type && filterToolbarButtonActive,
              )}
            >
              {notificationTypeLabel(type)}
            </button>
          ),
        )}
      </div>

      {feed.isLoading ? (
        <div className={appPanel}>
          <p className="px-5 py-10 text-sm text-[#6f6a60]">Loading notifications…</p>
        </div>
      ) : feed.isError ? (
        <div className={appPanel}>
          <p className="px-5 py-10 text-sm text-[#9a3b2e]">
            Could not load notifications.{" "}
            <button type="button" className="underline" onClick={() => void feed.refetch()}>
              Retry
            </button>
          </p>
        </div>
      ) : feed.items.length === 0 ? (
        <div className={appPanel}>
          <p className="px-5 py-10 text-sm text-[#6f6a60]">No notifications yet.</p>
        </div>
      ) : (
        <div className={cn(appPanel, "overflow-hidden")} aria-live="polite">
          <ul className="divide-y divide-[#15130f]/10">
            {feed.items.map((item) => (
              <li key={item.id}>
                <NotificationRow
                  item={item}
                  onMarkRead={markRead}
                  onOpen={(event, row) => void openNotification(event, row)}
                />
              </li>
            ))}
          </ul>
          {feed.hasMore ? (
            <div className="border-t border-[#15130f]/10 px-5 py-4 text-center">
              <button
                type="button"
                disabled={feed.isFetchingMore}
                onClick={() => void feed.fetchNextPage()}
                className={appGhostButtonLg}
              >
                {feed.isFetchingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
