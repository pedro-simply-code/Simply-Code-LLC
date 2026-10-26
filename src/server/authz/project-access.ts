import "server-only";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isFounder, isTeam } from "~/lib/roles";
import { db } from "~/server/db";
import { projectMembers, type UserRole } from "~/server/db/schema";
import { isUuid } from "~/server/studio/queries";

export async function userHasStudioProjectAccess(
  userId: string,
  role: UserRole,
  projectId: string,
): Promise<boolean> {
  if (!isUuid(projectId) || !isTeam(role)) return false;
  if (isFounder(role)) return true;

  const [membership] = await db
    .select({ projectRole: projectMembers.projectRole })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .limit(1);

  return !!membership;
}

/** Redirects when the user is not on the studio project team. */
export async function requireStudioProjectMember(
  userId: string,
  role: UserRole,
  projectId: string,
  redirectTo = "/studio/projects",
): Promise<void> {
  const allowed = await userHasStudioProjectAccess(userId, role, projectId);
  if (!allowed) redirect(redirectTo);
}
