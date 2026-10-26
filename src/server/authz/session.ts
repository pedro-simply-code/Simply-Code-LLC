import "server-only";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "~/lib/auth";
import { isFounder, isTeam } from "~/lib/roles";
import { db } from "~/server/db";
import { projectMembers, type UserRole } from "~/server/db/schema";
import { isUuid } from "~/server/studio/queries";

export type AuthSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    role: UserRole;
  };
};

export async function requireSession(): Promise<AuthSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session as AuthSession;
}

export async function requireTeam(): Promise<AuthSession> {
  const session = await requireSession();
  if (!isTeam(session.user.role)) redirect("/portal");
  return session;
}

export async function requireFounder(): Promise<AuthSession> {
  const session = await requireTeam();
  if (!isFounder(session.user.role)) redirect("/studio");
  return session;
}

/** Founder or project lead for the given project. */
export async function requireProjectManager(projectId: string): Promise<AuthSession> {
  const session = await requireTeam();
  if (isUuid(projectId)) {
    if (isFounder(session.user.role)) return session;
    const [membership] = await db
      .select({ projectRole: projectMembers.projectRole })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, session.user.id),
          eq(projectMembers.projectRole, "lead"),
        ),
      )
      .limit(1);
    if (membership) return session;
  }
  redirect("/studio/projects");
}

/** Any assigned team member (or founder). */
export async function requireProjectTeamMember(projectId: string): Promise<AuthSession> {
  const session = await requireTeam();
  if (!isUuid(projectId)) redirect("/studio/projects");

  if (isFounder(session.user.role)) return session;

  const [membership] = await db
    .select({ projectRole: projectMembers.projectRole })
    .from(projectMembers)
    .where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, session.user.id)),
    )
    .limit(1);

  if (!membership) redirect("/studio/projects");
  return session;
}
