import type { UserRole } from "~/server/db/schema";

export type ProjectMemberRole = "lead" | "developer";

export type ProjectMembership = {
  projectRole: ProjectMemberRole;
};

/** Client-visible project updates: founders and project leads only. */
export function canPublishClientVisibleUpdate(
  role: UserRole,
  membership: ProjectMembership | null,
): boolean {
  if (role === "founder" || role === "admin") return true;
  return membership?.projectRole === "lead";
}

export function canManageProject(
  role: UserRole,
  membership: ProjectMembership | null,
): boolean {
  if (role === "founder" || role === "admin") return true;
  return membership?.projectRole === "lead";
}

export function canViewStudioProject(
  role: UserRole,
  membership: ProjectMembership | null,
): boolean {
  if (role === "founder" || role === "admin") return true;
  return membership !== null;
}
