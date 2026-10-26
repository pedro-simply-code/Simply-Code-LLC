import { describe, expect, it } from "vitest";
import { buildProjectActivityFeed } from "~/server/projects/activity";

describe("buildProjectActivityFeed", () => {
  it("hides internal updates and deliverables in portal", () => {
    const feed = buildProjectActivityFeed(
      {
        updates: [
          {
            id: "1",
            title: "Public",
            body: "",
            visibility: "client",
            createdAt: new Date("2026-01-02"),
            authorName: null,
          },
          {
            id: "2",
            title: "Secret",
            body: "",
            visibility: "internal",
            createdAt: new Date("2026-01-03"),
            authorName: null,
          },
        ],
        requests: [],
        deliverables: [
          {
            id: "d1",
            title: "Client file",
            description: "",
            visibility: "client",
            fileName: "a.pdf",
            createdAt: new Date("2026-01-01"),
            uploaderName: null,
          },
        ],
        milestones: [
          {
            id: "m1",
            title: "Done",
            description: "",
            status: "completed",
            completedAt: new Date("2026-01-04"),
            createdAt: new Date("2026-01-01"),
          },
          {
            id: "m2",
            title: "WIP",
            description: "",
            status: "in_progress",
            completedAt: null,
            createdAt: new Date("2026-01-01"),
          },
        ],
      },
      "portal",
    );

    expect(feed.map((item) => item.title)).toEqual([
      "Done",
      "Public",
      "Client file",
    ]);
  });
});
