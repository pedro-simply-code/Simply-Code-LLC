import "server-only";

import { eq, inArray } from "drizzle-orm";
import type { TeamMember } from "~/content/team";
import { isTeam, normalizeRole, roleLabel, type AppRole } from "~/lib/roles";
import { db } from "~/server/db";
import { technologies, userTechnologies, users } from "~/server/db/schema";

const ABOUT_TEAM_ROLE_ORDER: Record<AppRole, number> = {
  founder: 0,
  lead: 1,
  developer: 2,
  client: 99,
};

export async function getUserProfile(userId: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

/** Everyone in Studio team (founder, lead, developer) — same roster as /studio/team. */
export async function getPublicAboutTeam(): Promise<TeamMember[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      title: users.title,
      bio: users.bio,
      image: users.image,
      role: users.role,
      profileSkills: users.profileSkills,
      showOnAbout: users.showOnAbout,
      linkedinUrl: users.linkedinUrl,
      githubUrl: users.githubUrl,
      portfolioUrl: users.portfolioUrl,
    })
    .from(users);

  const teamRows = rows.filter((row) => isTeam(row.role));
  const anyOptedIn = teamRows.some((row) => row.showOnAbout);
  const visibleTeam = anyOptedIn
    ? teamRows.filter((row) => row.showOnAbout)
    : teamRows;
  const teamIds = visibleTeam.map((row) => row.id);

  const assignmentRows =
    teamIds.length === 0
      ? []
      : await db
          .select({
            userId: userTechnologies.userId,
            name: technologies.name,
          })
          .from(userTechnologies)
          .innerJoin(
            technologies,
            eq(technologies.id, userTechnologies.technologyId),
          )
          .where(inArray(userTechnologies.userId, teamIds));

  const skillsByUserId = new Map<string, string[]>();
  for (const assignment of assignmentRows) {
    const current = skillsByUserId.get(assignment.userId) ?? [];
    current.push(assignment.name);
    skillsByUserId.set(assignment.userId, current);
  }

  return visibleTeam
    .sort((a, b) => {
      const byRole =
        ABOUT_TEAM_ROLE_ORDER[normalizeRole(a.role)] -
        ABOUT_TEAM_ROLE_ORDER[normalizeRole(b.role)];
      if (byRole !== 0) return byRole;
      return (a.name ?? "").localeCompare(b.name ?? "", undefined, {
        sensitivity: "base",
      });
    })
    .map((row) => {
      const fromTechnologies = (skillsByUserId.get(row.id) ?? []).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
      const fromProfile = row.profileSkills ?? [];
      const skills =
        fromTechnologies.length > 0
          ? fromTechnologies
          : fromProfile.filter(Boolean);

      return {
        id: row.id,
        name: row.name?.trim() || "Team member",
        role: row.title?.trim() || roleLabel(row.role),
        skills,
        image: row.image,
        bio: row.bio,
        linkedinUrl: row.linkedinUrl,
        githubUrl: row.githubUrl,
        portfolioUrl: row.portfolioUrl,
      };
    });
}

/** `null` only when the database is unavailable; otherwise returns the team list (may be empty). */
export async function getPublicAboutTeamSafe(): Promise<TeamMember[] | null> {
  try {
    return await getPublicAboutTeam();
  } catch {
    return null;
  }
}
