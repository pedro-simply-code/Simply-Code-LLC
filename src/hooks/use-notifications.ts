"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  notificationsQueryKey,
  type NotificationContext,
  type NotificationsQueryParams,
} from "~/lib/notifications-api";
import { emitNotificationsChanged } from "~/lib/notifications-client";

const BELL_LIMIT = 8;
const PAGE_LIMIT = 20;
const POLL_MS = 30_000;

function bellRefetchInterval(): number | false {
  if (typeof document === "undefined") return false;
  return document.hidden ? false : POLL_MS;
}

export function useNotificationsBell(context: NotificationContext) {
  const queryClient = useQueryClient();

  const params: NotificationsQueryParams = useMemo(
    () => ({
      context,
      limit: BELL_LIMIT,
    }),
    [context],
  );

  const query = useQuery({
    queryKey: notificationsQueryKey(params),
    queryFn: () => fetchNotifications(params),
    refetchInterval: bellRefetchInterval,
    refetchOnWindowFocus: true,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      emitNotificationsChanged({ unread: 0 });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markRead = useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: (unread, id) => {
      emitNotificationsChanged({ unread, id });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    items: query.data?.items ?? [],
    unread: query.data?.unread ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAllRead,
    markRead,
  };
}

export function useNotificationsWorkspace(
  context: NotificationContext,
  options?: { type?: string; entityId?: string },
) {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState(options?.type ?? "");

  const baseParams: Omit<NotificationsQueryParams, "cursor"> = useMemo(
    () => ({
      context,
      limit: PAGE_LIMIT,
      unreadOnly,
      type: typeFilter || undefined,
      entityId: options?.entityId,
    }),
    [context, unreadOnly, typeFilter, options?.entityId],
  );

  const query = useInfiniteQuery({
    queryKey: notificationsQueryKey({ ...baseParams, cursor: "" }),
    queryFn: ({ pageParam }) =>
      fetchNotifications({
        ...baseParams,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: true,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      emitNotificationsChanged({ unread: 0 });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markRead = useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: (unread, id) => {
      emitNotificationsChanged({ unread, id });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  const unread = query.data?.pages[0]?.unread ?? 0;

  return {
    items,
    unread,
    isLoading: query.isLoading,
    isError: query.isError,
    unreadOnly,
    setUnreadOnly,
    typeFilter,
    setTypeFilter,
    markAllRead,
    markRead,
    fetchNextPage: query.fetchNextPage,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}
