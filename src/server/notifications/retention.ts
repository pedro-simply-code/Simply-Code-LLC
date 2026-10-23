import "server-only";

import { pruneOldNotifications } from "~/server/notifications/repository";

/** Run from a scheduled job (e.g. cron) to cap table growth. */
export async function runNotificationRetention(olderThanDays = 90) {
  const removed = await pruneOldNotifications(olderThanDays);
  console.info("[notifications] retention removed", { removed, olderThanDays });
  return removed;
}
