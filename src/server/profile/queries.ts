import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import type { TeamMember } from "~/content/team";
import { isTeam, roleLabel } from "~/lib/roles";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const ABOUT_TEAM_ROLES = ["founder", "admin", "lead", "developer", "user"] as const;

export async function getUserProfile(userId: string) {
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return row ?? null;
}

export async function getPublicAboutTeam(): Promise<TeamMember[]> {
  const rows = await db
    .select({
      name: users.name,
      title: users.title,
      image: users.image,
      role: users.role,
      profileSkills: users.profileSkills,
    })
    .from(users)
    .where(and(eq(users.showOnAbout, true), inArray(users.role, [...ABOUT_TEAM_ROLES])))
    .orderBy(asc(users.name));

  return rows
    .filter((row) => isTeam(row.role))
    .map((row) => ({
      name: row.name?.trim() || "Team member",
      role: row.title?.trim() || roleLabel(row.role),
      skills: row.profileSkills ?? [],
      image: row.image,
    }));
}

export async function getPublicAboutTeamSafe(): Promise<TeamMember[] | null> {
  try {
    const members = await getPublicAboutTeam();
    return members.length > 0 ? members : null;
  } catch {
    return null;
  }
}
