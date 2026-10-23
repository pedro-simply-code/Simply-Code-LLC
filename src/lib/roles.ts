import type { UserRole } from "~/server/db/schema";

/** Roles used by the app after legacy values are normalised. */
export type AppRole = "founder" | "lead" | "developer" | "client";

export function normalizeRole(role?: UserRole | null): AppRole {
  if (role === "admin" || role === "founder") return "founder";
  if (role === "lead") return "lead";
  if (role === "user" || role === "developer") return "developer";
  return "client";
}

export function isFounder(role?: UserRole | null): boolean {
  return normalizeRole(role) === "founder";
}

export function isTeam(role?: UserRole | null): boolean {
  return normalizeRole(role) !== "client";
}

export function canManageTeam(role?: UserRole | null): boolean {
  return isFounder(role);
}

export function canManageTechnologies(role?: UserRole | null): boolean {
  return isFounder(role);
}

/** Only founders can create projects. Leads can edit the projects they lead. */
export function canCreateProjects(role?: UserRole | null): boolean {
  return isFounder(role);
}

/** Reviews are curated by founders only. */
export function canManageReviews(role?: UserRole | null): boolean {
  return isFounder(role);
}

export function roleLabel(role?: UserRole | null): string {
  return {
    founder: "Founder",
    lead: "Lead",
    developer: "Developer",
    client: "Client",
  }[normalizeRole(role)];
}

export function homePathForRole(role?: UserRole | null): string {
  return normalizeRole(role) === "client" ? "/portal" : "/studio";
}
