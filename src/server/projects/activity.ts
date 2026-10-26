export type ProjectActivityKind =
  | "update"
  | "request"
  | "deliverable"
  | "milestone";

export type ProjectActivityItem = {
  id: string;
  kind: ProjectActivityKind;
  title: string;
  body: string;
  at: Date;
  meta: string;
};

type ActivityInput = {
  updates: {
    id: string;
    title: string;
    body: string;
    visibility: string;
    createdAt: Date;
    authorName: string | null;
  }[];
  requests: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: Date;
  }[];
  deliverables: {
    id: string;
    title: string;
    description: string;
    visibility: string;
    fileName: string;
    createdAt: Date;
    uploaderName: string | null;
  }[];
  milestones: {
    id: string;
    title: string;
    description: string;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
  }[];
};

export function buildProjectActivityFeed(
  input: ActivityInput,
  audience: "studio" | "portal",
): ProjectActivityItem[] {
  const items: ProjectActivityItem[] = [];

  for (const update of input.updates) {
    if (audience === "portal" && update.visibility !== "client") continue;
    items.push({
      id: `update-${update.id}`,
      kind: "update",
      title: update.title,
      body: update.body,
      at: update.createdAt,
      meta: update.authorName ? `Update · ${update.authorName}` : "Progress update",
    });
  }

  for (const request of input.requests) {
    items.push({
      id: `request-${request.id}`,
      kind: "request",
      title: request.title,
      body: request.description,
      at: request.createdAt,
      meta: `Request · ${request.status}`,
    });
  }

  for (const file of input.deliverables) {
    if (audience === "portal" && file.visibility !== "client") continue;
    items.push({
      id: `deliverable-${file.id}`,
      kind: "deliverable",
      title: file.title,
      body: file.description || file.fileName,
      at: file.createdAt,
      meta: file.uploaderName ? `Deliverable · ${file.uploaderName}` : "New deliverable",
    });
  }

  for (const milestone of input.milestones) {
    if (audience === "portal" && milestone.status !== "completed") continue;
    items.push({
      id: `milestone-${milestone.id}`,
      kind: "milestone",
      title: milestone.title,
      body: milestone.description,
      at: milestone.completedAt ?? milestone.createdAt,
      meta:
        milestone.status === "completed"
          ? "Milestone completed"
          : `Milestone · ${milestone.status.replace("_", " ")}`,
    });
  }

  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items;
}
