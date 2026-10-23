import { describe, expect, it } from "vitest";
import { groupNotificationsByEntity } from "~/server/notifications/labels";

describe("groupNotificationsByEntity", () => {
  it("merges adjacent rows with the same entity", () => {
    const rows = [
      {
        id: "1",
        entityType: "project",
        entityId: "a",
        type: "project",
        createdAt: new Date("2026-01-02"),
      },
      {
        id: "2",
        entityType: "project",
        entityId: "a",
        type: "project",
        createdAt: new Date("2026-01-01"),
      },
    ];

    const grouped = groupNotificationsByEntity(rows);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.groupCount).toBe(2);
  });
});
