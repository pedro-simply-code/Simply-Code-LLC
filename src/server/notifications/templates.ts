import type { CreateNotificationInput } from "~/server/notifications/types";

export function projectStudioHref(projectId: string, tab?: string) {
  return tab ? `/studio/projects/${projectId}?tab=${tab}` : `/studio/projects/${projectId}`;
}

export function projectPortalHref(projectId: string) {
  return `/portal/projects/${projectId}`;
}

export function withProjectEntity(
  projectId: string,
  input: Omit<CreateNotificationInput, "entityType" | "entityId"> & {
    projectTitle?: string;
  },
): CreateNotificationInput {
  const { projectTitle, metadata: inputMetadata, ...rest } = input;
  const metadata = { ...(inputMetadata ?? {}) };
  if (projectTitle) {
    metadata.projectTitle = projectTitle;
  }
  return {
    ...rest,
    entityType: "project",
    entityId: projectId,
    metadata,
  };
}
