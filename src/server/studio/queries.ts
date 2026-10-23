import "server-only";

import { and, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "~/server/db";
import {
  clientMembers,
  clients,
  contactMessages,
  notifications,
  projectMembers,
  projectRequests,
  projectTechnologies,
  projectUpdates,
  projects,
  reviews,
  technologies,
  userTechnologies,
  users,
} from "~/server/db/schema";
import { projectDisplayYear } from "~/lib/project-year";
import { normalizeRole } from "~/lib/roles";
import type { Project as ContentProject } from "~/content/projects";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Completed projects stay visible in the public portfolio. */
const PUBLIC_PROJECT_STATUSES = ["published", "completed"] as const;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      title: users.title,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getTeamUsers() {
  const rows = await getAllUsers();
  return rows.filter((user) => normalizeRole(user.role) !== "client");
}

export async function getTechnologies() {
  const [techRows, userLinks, projectLinks] = await Promise.all([
    db.select().from(technologies).orderBy(technologies.name),
    db.select().from(userTechnologies),
    db.select().from(projectTechnologies),
  ]);

  return techRows.map((technology) => ({
    ...technology,
    developerCount: userLinks.filter((link) => link.technologyId === technology.id).length,
    projectCount: projectLinks.filter((link) => link.technologyId === technology.id).length,
  }));
}

export async function getTechnologyAssignments(userId: string) {
  return db
    .select({
      technologyId: userTechnologies.technologyId,
      name: technologies.name,
      level: userTechnologies.level,
    })
    .from(userTechnologies)
    .innerJoin(technologies, eq(technologies.id, userTechnologies.technologyId))
    .where(eq(userTechnologies.userId, userId));
}

export async function getStudioProjects(viewerId?: string) {
  let memberProjectIds: string[] | null = null;
  if (viewerId) {
    const memberships = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, viewerId));
    memberProjectIds = memberships.map((membership) => membership.projectId);
    if (memberProjectIds.length === 0) return [];
  }

  const query = db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      clientName: projects.clientName,
      year: projects.year,
      status: projects.status,
      featured: projects.featured,
      updatedAt: projects.updatedAt,
      leadId: projectMembers.userId,
      leadName: users.name,
      leadEmail: users.email,
    })
    .from(projects)
    .leftJoin(
      projectMembers,
      and(eq(projectMembers.projectId, projects.id), eq(projectMembers.projectRole, "lead")),
    )
    .leftJoin(users, eq(users.id, projectMembers.userId));

  const rows = memberProjectIds
    ? await query
        .where(inArray(projects.id, memberProjectIds))
        .orderBy(desc(projects.updatedAt))
    : await query.orderBy(desc(projects.updatedAt));

  const stackByProjectId = await technologyNamesByProjectIds(rows.map((row) => row.id));
  return rows.map((row) => ({
    ...row,
    stackLabel: (stackByProjectId.get(row.id) ?? []).join(", "),
  }));
}

export async function getProjectById(id: string) {
  if (!isUuid(id)) return null;

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;

  const [members, tech, updates, requests] = await Promise.all([
    db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        projectRole: projectMembers.projectRole,
        assignedAt: projectMembers.createdAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(projectMembers.projectId, id))
      .orderBy(projectMembers.projectRole, users.name),
    db
      .select({
        id: technologies.id,
        name: technologies.name,
        category: technologies.category,
      })
      .from(projectTechnologies)
      .innerJoin(technologies, eq(technologies.id, projectTechnologies.technologyId))
      .where(eq(projectTechnologies.projectId, id))
      .orderBy(technologies.name),
    db
      .select({
        id: projectUpdates.id,
        title: projectUpdates.title,
        body: projectUpdates.body,
        visibility: projectUpdates.visibility,
        createdAt: projectUpdates.createdAt,
        authorName: users.name,
      })
      .from(projectUpdates)
      .leftJoin(users, eq(users.id, projectUpdates.authorId))
      .where(eq(projectUpdates.projectId, id))
      .orderBy(desc(projectUpdates.createdAt)),
    db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.projectId, id))
      .orderBy(desc(projectRequests.createdAt)),
  ]);

  return { project, members, technologies: tech, updates, requests };
}

export async function getPublicProjects(): Promise<ContentProject[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(inArray(projects.status, [...PUBLIC_PROJECT_STATUSES]))
    .orderBy(desc(projects.featured), desc(projects.createdAt));

  const stackByProjectId = await technologyNamesByProjectIds(rows.map((row) => row.id));
  return rows.map((row) => toContentProject(row, stackByProjectId.get(row.id) ?? []));
}

export async function getPublicProject(slug: string): Promise<ContentProject | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.slug, slug),
        inArray(projects.status, [...PUBLIC_PROJECT_STATUSES]),
      ),
    )
    .limit(1);

  if (!row) return null;

  const stackByProjectId = await technologyNamesByProjectIds([row.id]);
  return toContentProject(row, stackByProjectId.get(row.id) ?? []);
}

/** Public pages fall back to the bundled content if the database is unavailable. */
export async function getPublicProjectsSafe(): Promise<ContentProject[] | null> {
  try {
    const rows = await getPublicProjects();
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export async function getPublicProjectSafe(slug: string): Promise<ContentProject | null> {
  try {
    return await getPublicProject(slug);
  } catch {
    return null;
  }
}

export type PublicProjectReview = {
  quote: string;
  authorName: string;
  rating: number;
};

export async function getApprovedReviewForProjectSlug(
  slug: string,
): Promise<PublicProjectReview | null> {
  const [row] = await db
    .select({
      quote: reviews.quote,
      authorName: reviews.authorName,
      rating: reviews.rating,
    })
    .from(reviews)
    .innerJoin(projects, eq(projects.id, reviews.projectId))
    .where(
      and(
        eq(projects.slug, slug),
        eq(reviews.status, "approved"),
        inArray(projects.status, [...PUBLIC_PROJECT_STATUSES]),
      ),
    )
    .orderBy(desc(reviews.createdAt))
    .limit(1);

  return row ?? null;
}

export async function getApprovedReviewForProjectSlugSafe(
  slug: string,
): Promise<PublicProjectReview | null> {
  try {
    return await getApprovedReviewForProjectSlug(slug);
  } catch {
    return null;
  }
}

export async function getApprovedReviewsSafe() {
  try {
    const rows = await getApprovedReviews();
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(inArray(projects.status, [...PUBLIC_PROJECT_STATUSES]));
  return rows.map((row) => row.slug);
}

async function technologyNamesByProjectIds(
  projectIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (projectIds.length === 0) return map;

  const links = await db
    .select({
      projectId: projectTechnologies.projectId,
      name: technologies.name,
    })
    .from(projectTechnologies)
    .innerJoin(technologies, eq(technologies.id, projectTechnologies.technologyId))
    .where(inArray(projectTechnologies.projectId, projectIds))
    .orderBy(technologies.name);

  for (const link of links) {
    const list = map.get(link.projectId) ?? [];
    list.push(link.name);
    map.set(link.projectId, list);
  }

  return map;
}

function toContentProject(
  row: typeof projects.$inferSelect,
  technologyNames: string[] = [],
): ContentProject {
  return {
    slug: row.slug,
    image: row.image ?? undefined,
    category: row.category,
    title: row.title,
    client: row.clientName || row.title,
    year: projectDisplayYear(row.createdAt),
    summary: row.summary,
    tags: technologyNames,
    liveUrl: row.liveUrl ?? undefined,
  };
}

export async function getReviews() {
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function getContactMessages() {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);
}

export async function getApprovedReviews() {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(12);
}

export async function getClients() {
  return db.select().from(clients).orderBy(clients.name);
}

export async function getClientsWithMembers() {
  const [clientRows, memberRows] = await Promise.all([
    getClients(),
    db
      .select({
        clientId: clientMembers.clientId,
        userId: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        memberRole: clientMembers.role,
      })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId)),
  ]);

  return clientRows.map((client) => ({
    ...client,
    members: memberRows.filter((member) => member.clientId === client.id),
  }));
}

export async function getClientIdsForUser(userId: string): Promise<string[]> {
  const rows = await db
    .select({ clientId: clientMembers.clientId })
    .from(clientMembers)
    .where(eq(clientMembers.userId, userId));
  return rows.map((row) => row.clientId);
}

export async function getPortalProjects(userId: string) {
  const clientIds = await getClientIdsForUser(userId);
  if (clientIds.length === 0) return [];

  const projectRows = await db
    .select()
    .from(projects)
    .where(inArray(projects.clientId, clientIds))
    .orderBy(desc(projects.updatedAt));

  if (projectRows.length === 0) return [];

  const ids = projectRows.map((project) => project.id);
  const [members, updateRows] = await Promise.all([
    db
      .select({
        projectId: projectMembers.projectId,
        name: users.name,
        email: users.email,
        projectRole: projectMembers.projectRole,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(inArray(projectMembers.projectId, ids)),
    db
      .select({
        projectId: projectUpdates.projectId,
        id: projectUpdates.id,
        title: projectUpdates.title,
        createdAt: projectUpdates.createdAt,
      })
      .from(projectUpdates)
      .where(and(inArray(projectUpdates.projectId, ids), eq(projectUpdates.visibility, "client")))
      .orderBy(desc(projectUpdates.createdAt)),
  ]);

  const stackByProjectId = await technologyNamesByProjectIds(ids);

  return projectRows.map((project) => ({
    ...project,
    stackLabel: (stackByProjectId.get(project.id) ?? []).join(", "),
    lead: members.find(
      (member) => member.projectId === project.id && member.projectRole === "lead",
    ) ?? null,
    updates: updateRows.filter((update) => update.projectId === project.id),
  }));
}

export async function getPortalProject(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const clientIds = await getClientIdsForUser(userId);
  if (clientIds.length === 0) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), inArray(projects.clientId, clientIds)))
    .limit(1);
  if (!project) return null;

  const [updates, requests, members, clientReview] = await Promise.all([
    db
      .select({
        id: projectUpdates.id,
        title: projectUpdates.title,
        body: projectUpdates.body,
        createdAt: projectUpdates.createdAt,
        authorName: users.name,
      })
      .from(projectUpdates)
      .leftJoin(users, eq(users.id, projectUpdates.authorId))
      .where(
        and(eq(projectUpdates.projectId, id), eq(projectUpdates.visibility, "client")),
      )
      .orderBy(desc(projectUpdates.createdAt)),
    db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.projectId, id))
      .orderBy(desc(projectRequests.createdAt)),
    db
      .select({
        name: users.name,
        projectRole: projectMembers.projectRole,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(projectMembers.projectId, id)),
    project.clientId
      ? db
          .select()
          .from(reviews)
          .where(
            and(
              eq(reviews.projectId, id),
              eq(reviews.clientId, project.clientId),
              ne(reviews.status, "hidden"),
            ),
          )
          .orderBy(desc(reviews.createdAt))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return {
    project,
    updates,
    requests,
    lead: members.find((member) => member.projectRole === "lead") ?? null,
    review: clientReview[0] ?? null,
  };
}

export async function getNotifications(userId: string, limit = 20) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: string) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function markAllNotificationsReadForUser(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

export async function markNotificationReadForUser(userId: string, notificationId: string) {
  if (!isUuid(notificationId)) return false;

  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id });

  return updated.length > 0;
}

export async function getStudioOverview(viewerId?: string) {
  const [allProjects, allUsers, allTechnologies, allReviews] = await Promise.all([
    getStudioProjects(viewerId),
    getAllUsers(),
    getTechnologies(),
    getReviews(),
  ]);

  return {
    projectCount: allProjects.length,
    publishedCount: allProjects.filter(
      (project) => project.status === "published" || project.status === "completed",
    ).length,
    teamCount: allUsers.filter((user) => normalizeRole(user.role) !== "client").length,
    clientCount: allUsers.filter((user) => normalizeRole(user.role) === "client").length,
    technologyCount: allTechnologies.length,
    pendingReviewCount: allReviews.filter((review) => review.status === "pending").length,
    recentProjects: allProjects.slice(0, 5),
  };
}

export async function getProjectEmailRecipients(projectId: string) {
  const rows = await db
    .select({
      email: users.email,
      name: users.name,
      role: users.role,
      projectRole: projectMembers.projectRole,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId));

  const leads = rows.filter((row) => row.projectRole === "lead" && row.email);
  if (leads.length > 0) return leads;

  // A lead-team member working on the project can receive its email even when
  // they are not the assigned lead. Plain developers never do.
  const teamLeads = rows.filter((row) => normalizeRole(row.role) === "lead" && row.email);
  if (teamLeads.length > 0) return teamLeads;

  const founders = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(inArray(users.role, ["founder", "admin"]));

  return founders.filter((row) => row.email);
}
