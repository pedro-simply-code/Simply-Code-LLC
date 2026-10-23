import type { NotificationType } from "~/server/notifications/types";

export function notificationTypeLabel(type: string): string {
  const labels: Record<NotificationType, string> = {
    contact: "Contact",
    project: "Project",
    review: "Review",
    request: "Request",
    message: "Message",
    system: "System",
  };
  if (type in labels) return labels[type as NotificationType];
  return type;
}

export function groupNotificationsByEntity<T extends { entityType: string | null; entityId: string | null; type: string; createdAt: Date | string }>(
  rows: T[],
): Array<T & { groupCount: number }> {
  const result: Array<T & { groupCount: number }> = [];
  for (const row of rows) {
    const prev = result[result.length - 1];
    const sameGroup =
      prev &&
      prev.entityType === row.entityType &&
      prev.entityId === row.entityId &&
      prev.type === row.type &&
      row.entityType &&
      row.entityId;

    if (sameGroup) {
      prev.groupCount += 1;
      continue;
    }
    result.push({ ...row, groupCount: 1 });
  }
  return result;
}
