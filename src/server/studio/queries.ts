import "server-only";

import { and, desc, eq, gt, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { db } from "~/server/db";
import {
  clientMembers,
  clients,
  contactMessages,
  invites,
  projectDeliverables,
  projectMembers,
  projectMilestones,
  projectRequests,
  projectTechnologies,
  projectUpdates,
  projects,
  reviews,
  technologies,
  userTechnologies,
  users,
  type UserRole,
} from "~/server/db/schema";
import { projectDisplayYear } from "~/lib/project-year";
import { normalizeRole } from "~/lib/roles";
import { buildProjectActivityFeed, type ProjectActivityItem } from "~/server/projects/activity";
import type { Project as ContentProject } from "~/content/projects";
import { getUnreadNotificationCount } from "~/server/notifications";

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
      profileSkills: users.profileSkills,
      showOnAbout: users.showOnAbout,
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

export type UserTechnologyChip = {
  technologyId: string;
  name: string;
  category: string | null;
};

export async function getTechnologyAssignmentsForUsers(
  userIds: string[],
): Promise<Map<string, UserTechnologyChip[]>> {
  const map = new Map<string, UserTechnologyChip[]>();
  if (userIds.length === 0) return map;

  const rows = await db
    .select({
      userId: userTechnologies.userId,
      technologyId: userTechnologies.technologyId,
      name: technologies.name,
      category: technologies.category,
    })
    .from(userTechnologies)
    .innerJoin(technologies, eq(technologies.id, userTechnologies.technologyId))
    .where(inArray(userTechnologies.userId, userIds))
    .orderBy(technologies.name);

  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    list.push({
      technologyId: row.technologyId,
      name: row.name,
      category: row.category,
    });
    map.set(row.userId, list);
  }
  return map;
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
      summary: projects.summary,
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

  const [members, tech, updates, requests, milestones, deliverables] = await Promise.all([
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
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, id))
      .orderBy(projectMilestones.sortOrder, projectMilestones.createdAt),
    db
      .select({
        id: projectDeliverables.id,
        projectId: projectDeliverables.projectId,
        title: projectDeliverables.title,
        description: projectDeliverables.description,
        fileUrl: projectDeliverables.fileUrl,
        fileName: projectDeliverables.fileName,
        fileSize: projectDeliverables.fileSize,
        contentType: projectDeliverables.contentType,
        visibility: projectDeliverables.visibility,
        uploadedById: projectDeliverables.uploadedById,
        createdAt: projectDeliverables.createdAt,
        uploaderName: users.name,
      })
      .from(projectDeliverables)
      .leftJoin(users, eq(users.id, projectDeliverables.uploadedById))
      .where(eq(projectDeliverables.projectId, id))
      .orderBy(desc(projectDeliverables.createdAt)),
  ]);

  const activity = buildProjectActivityFeed(
    {
      updates,
      requests,
      deliverables,
      milestones,
    },
    "studio",
  );

  return { project, members, technologies: tech, updates, requests, milestones, deliverables, activity };
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

export {
  getApprovedReviewForProjectSlugSafe,
  getPublicProjectSafe,
  getPublicProjectsSafe,
} from "~/server/queries/public-cache";

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

export type ClientOverviewRow = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  memberCount: number;
  projectCount: number;
  pendingInviteCount: number;
};

export async function getClientsOverview(): Promise<ClientOverviewRow[]> {
  const clientRows = await getClients();
  const [memberLinks, projectLinks, pendingInvites] = await Promise.all([
    db.select({ clientId: clientMembers.clientId }).from(clientMembers),
    db
      .select({ clientId: projects.clientId })
      .from(projects)
      .where(isNotNull(projects.clientId)),
    db
      .select({ clientId: invites.clientId })
      .from(invites)
      .where(
        and(
          isNull(invites.acceptedAt),
          gt(invites.expiresAt, new Date()),
          eq(invites.role, "client"),
        ),
      ),
  ]);

  return clientRows.map((client) => ({
    id: client.id,
    name: client.name,
    slug: client.slug,
    contactEmail: client.contactEmail,
    memberCount: memberLinks.filter((row) => row.clientId === client.id).length,
    projectCount: projectLinks.filter((row) => row.clientId === client.id).length,
    pendingInviteCount: pendingInvites.filter((row) => row.clientId === client.id).length,
  }));
}

export type ClientPortalMember = {
  userId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
};

export type ClientLinkedProject = {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
};

export type ClientDetail = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  members: ClientPortalMember[];
  pendingInvites: Array<{ id: string; email: string; expiresAt: Date }>;
  projects: ClientLinkedProject[];
};

export async function getClientDetail(clientId: string): Promise<ClientDetail | null> {
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  if (!client) return null;

  const [members, pendingInvites, projectRows] = await Promise.all([
    db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId))
      .where(eq(clientMembers.clientId, clientId)),
    db
      .select({
        id: invites.id,
        email: invites.email,
        expiresAt: invites.expiresAt,
      })
      .from(invites)
      .where(
        and(
          eq(invites.clientId, clientId),
          isNull(invites.acceptedAt),
          gt(invites.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(invites.createdAt)),
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.updatedAt)),
  ]);

  return {
    id: client.id,
    name: client.name,
    slug: client.slug,
    contactEmail: client.contactEmail,
    members,
    pendingInvites,
    projects: projectRows,
  };
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

  const [updates, requests, members, clientReview, milestones, deliverables] = await Promise.all([
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
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, id))
      .orderBy(projectMilestones.sortOrder, projectMilestones.createdAt),
    db
      .select({
        id: projectDeliverables.id,
        projectId: projectDeliverables.projectId,
        title: projectDeliverables.title,
        description: projectDeliverables.description,
        fileUrl: projectDeliverables.fileUrl,
        fileName: projectDeliverables.fileName,
        fileSize: projectDeliverables.fileSize,
        contentType: projectDeliverables.contentType,
        visibility: projectDeliverables.visibility,
        uploadedById: projectDeliverables.uploadedById,
        createdAt: projectDeliverables.createdAt,
        uploaderName: users.name,
      })
      .from(projectDeliverables)
      .leftJoin(users, eq(users.id, projectDeliverables.uploadedById))
      .where(
        and(eq(projectDeliverables.projectId, id), eq(projectDeliverables.visibility, "client")),
      )
      .orderBy(desc(projectDeliverables.createdAt)),
  ]);

  const activity = buildProjectActivityFeed(
    {
      updates,
      requests,
      deliverables,
      milestones,
    },
    "portal",
  );

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;

  return {
    project,
    updates,
    requests,
    milestones,
    deliverables,
    activity,
    milestoneProgress:
      milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : null,
    lead: members.find((member) => member.projectRole === "lead") ?? null,
    review: clientReview[0] ?? null,
  };
}

export async function getPortalActivityFeed(
  userId: string,
  limit = 40,
): Promise<(ProjectActivityItem & { projectId: string; projectTitle: string })[]> {
  const projects = await getPortalProjects(userId);
  const combined: (ProjectActivityItem & { projectId: string; projectTitle: string })[] = [];

  for (const row of projects) {
    const detail = await getPortalProject(row.id, userId);
    if (!detail) continue;
    for (const item of detail.activity) {
      combined.push({
        ...item,
        projectId: row.id,
        projectTitle: row.title,
      });
    }
  }

  combined.sort((a, b) => b.at.getTime() - a.at.getTime());
  return combined.slice(0, limit);
}


export type StudioOverviewRequestItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  projectId: string;
  projectTitle: string;
  clientName: string | null;
  authorName: string | null;
  createdAt: Date;
};

export type StudioOverviewUpdateItem = {
  id: string;
  title: string;
  body: string;
  projectId: string;
  projectTitle: string;
  visibility: string;
  authorName: string | null;
  authorRole: string | null;
  projectRole: string | null;
  createdAt: Date;
};

export type StudioOverviewOptions = {
  /** When set, projects, requests, and updates are limited to these memberships. */
  projectViewerId?: string;
  userId: string;
  founder: boolean;
};

async function getOpenProjectRequestsForOverview(viewerId?: string) {
  let projectIds: string[] | null = null;
  if (viewerId) {
    const memberships = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, viewerId));
    projectIds = memberships.map((row) => row.projectId);
    if (projectIds.length === 0) return [];
  }

  const conditions = [eq(projectRequests.status, "open")];
  if (projectIds) {
    conditions.push(inArray(projectRequests.projectId, projectIds));
  }

  return db
    .select({
      id: projectRequests.id,
      title: projectRequests.title,
      description: projectRequests.description,
      type: projectRequests.type,
      priority: projectRequests.priority,
      createdAt: projectRequests.createdAt,
      projectId: projectRequests.projectId,
      projectTitle: projects.title,
      clientName: clients.name,
      authorName: users.name,
    })
    .from(projectRequests)
    .innerJoin(projects, eq(projects.id, projectRequests.projectId))
    .leftJoin(clients, eq(clients.id, projectRequests.clientId))
    .leftJoin(users, eq(users.id, projectRequests.createdById))
    .where(and(...conditions))
    .orderBy(desc(projectRequests.createdAt))
    .limit(12);
}

async function getRecentProjectUpdatesForOverview(viewerId?: string) {
  let projectIds: string[] | null = null;
  if (viewerId) {
    const memberships = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, viewerId));
    projectIds = memberships.map((row) => row.projectId);
    if (projectIds.length === 0) return [];
  }

  const baseQuery = db
    .select({
      id: projectUpdates.id,
      title: projectUpdates.title,
      body: projectUpdates.body,
      visibility: projectUpdates.visibility,
      createdAt: projectUpdates.createdAt,
      projectId: projectUpdates.projectId,
      projectTitle: projects.title,
      authorName: users.name,
      authorRole: users.role,
      projectRole: projectMembers.projectRole,
    })
    .from(projectUpdates)
    .innerJoin(projects, eq(projects.id, projectUpdates.projectId))
    .leftJoin(users, eq(users.id, projectUpdates.authorId))
    .leftJoin(
      projectMembers,
      and(
        eq(projectMembers.userId, projectUpdates.authorId),
        eq(projectMembers.projectId, projectUpdates.projectId),
      ),
    )
    .orderBy(desc(projectUpdates.createdAt))
    .limit(12);

  if (projectIds) {
    return baseQuery.where(inArray(projectUpdates.projectId, projectIds));
  }

  return baseQuery;
}

export async function getStudioOverview(options: StudioOverviewOptions) {
  const { projectViewerId, userId, founder } = options;

  const [allProjects, allUsers, allTechnologies, unreadNotificationCount, openRequests, recentUpdates] =
    await Promise.all([
      getStudioProjects(projectViewerId),
      founder ? getAllUsers() : Promise.resolve([]),
      founder ? getTechnologies() : Promise.resolve([]),
      getUnreadNotificationCount(userId, "studio"),
      getOpenProjectRequestsForOverview(projectViewerId),
      getRecentProjectUpdatesForOverview(projectViewerId),
    ]);

  const draftCount = allProjects.filter((project) => project.status === "draft").length;
  const publishedCount = allProjects.filter((project) => project.status === "published").length;
  const completedCount = allProjects.filter((project) => project.status === "completed").length;
  const publicPortfolioCount = publishedCount + completedCount;

  const overviewRequests: StudioOverviewRequestItem[] = openRequests.map((request) => ({
    id: request.id,
    title: request.title,
    description: request.description,
    type: request.type,
    priority: request.priority,
    projectId: request.projectId,
    projectTitle: request.projectTitle,
    clientName: request.clientName,
    authorName: request.authorName,
    createdAt: request.createdAt,
  }));

  const overviewUpdates: StudioOverviewUpdateItem[] = recentUpdates.map((update) => ({
    id: update.id,
    title: update.title,
    body: update.body,
    projectId: update.projectId,
    projectTitle: update.projectTitle,
    visibility: update.visibility,
    authorName: update.authorName,
    authorRole: update.authorRole,
    projectRole: update.projectRole,
    createdAt: update.createdAt,
  }));

  return {
    projectCount: allProjects.length,
    draftCount,
    publishedCount,
    completedCount,
    publicPortfolioCount,
    teamCount: founder
      ? allUsers.filter((user) => normalizeRole(user.role) !== "client").length
      : 0,
    clientCount: founder
      ? allUsers.filter((user) => normalizeRole(user.role) === "client").length
      : 0,
    technologyCount: founder ? allTechnologies.length : 0,
    unreadNotificationCount,
    openRequestCount: openRequests.length,
    overviewRequests,
    overviewUpdates,
    recentProjects: allProjects,
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
