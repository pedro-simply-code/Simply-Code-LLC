import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { getClientIdsForUser, isUuid } from "~/server/studio/queries";
import type { AuthSession } from "~/server/authz/session";

/** Ensures the signed-in client user may access this project. */
export async function requirePortalProject(
  session: AuthSession,
  projectId: string,
): Promise<void> {
  if (!isUuid(projectId)) redirect("/portal");

  const clientIds = await getClientIdsForUser(session.user.id);
  if (clientIds.length === 0) redirect("/portal");

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(eq(projects.id, projectId), inArray(projects.clientId, clientIds)),
    )
    .limit(1);

  if (!project) redirect("/portal");
}
