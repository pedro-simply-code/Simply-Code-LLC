"use server";

import { randomBytes } from "node:crypto";
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { resolveProjectImageFromForm } from "~/server/uploadthing-storage";
import { isFounder, isTeam, normalizeRole } from "~/lib/roles";
import { slugify } from "~/lib/slug";
import { acceptInviteSchema, clientInviteSchema, inviteSchema } from "~/schemas/auth";
import { hashPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import {
  clientMembers,
  clients,
  invites,
  projectMembers,
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
import {
  notifyFounders,
  notifyProject,
  notifyProjectClients,
  notifyUsers,
  sendProjectEmail,
} from "~/server/notifications";
import {
  getPortalProject,
  getProjectById,
  isUuid,
  markAllNotificationsReadForUser,
} from "~/server/studio/queries";
import { getInviteByToken } from "~/server/invites";
import { sendEmail } from "~/server/email/sendEmail";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function inviteLink(token: string): string {
  const base = env.AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL;
  const url = new URL("/accept-invite", base);
  url.searchParams.set("token", token);
  return url.toString();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function inviteEmailHtml(input: {
  link: string;
  role: UserRole;
  clientName?: string | null;
}): string {
  const destination =
    input.role === "client"
      ? `the ${escapeHtml(input.clientName ?? "client")} portal`
      : "the Simply Code studio";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#15130f;max-width:560px">
      <p>Hello,</p>
      <p>You have been invited to ${destination} on Simply Code.</p>
      <p>
        <a href="${input.link}" style="display:inline-block;background:#15130f;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;font-size:12px">
          Accept invitation
        </a>
      </p>
      <p>Or copy this link into your browser:<br /><a href="${input.link}">${input.link}</a></p>
      <p>This invitation expires in 7 days and can only be used once.</p>
      <p>If you were not expecting this email, you can ignore it.</p>
    </div>
  `;
}

async function sendInviteEmail(input: {
  email: string;
  token: string;
  role: UserRole;
  clientName?: string | null;
}): Promise<void> {
  const link = inviteLink(input.token);
  await sendEmail({
    to: input.email,
    subject: "You're invited to Simply Code",
    html: inviteEmailHtml({ link, role: input.role, clientName: input.clientName }),
  });
}

function statusValue(value: string): "draft" | "published" | "completed" {
  if (value === "published") return "published";
  if (value === "completed") return "completed";
  return "draft";
}

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

async function requireTeam() {
  const session = await requireSession();
  if (!isTeam(session.user.role)) redirect("/portal");
  return session;
}

async function requireFounder() {
  const session = await requireTeam();
  if (!isFounder(session.user.role)) redirect("/studio");
  return session;
}

async function requireProjectManager(projectId: string) {
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
  redirect(`/studio/projects`);
}

async function projectTitle(projectId: string): Promise<string> {
  const [row] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return row?.title ?? "Project";
}

async function uniqueProjectSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let candidate = root;
  let attempt = 1;
  while (true) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        excludeId
          ? and(eq(projects.slug, candidate), ne(projects.id, excludeId))
          : eq(projects.slug, candidate),
      )
      .limit(1);
    if (!row) return candidate;
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
}

async function syncUserLeadRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user || isFounder(user.role)) return;

  const [lead] = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(
      and(eq(projectMembers.userId, userId), eq(projectMembers.projectRole, "lead")),
    )
    .limit(1);

  if (lead && (user.role === "developer" || user.role === "user")) {
    await db.update(users).set({ role: "lead" }).where(eq(users.id, userId));
  }
  if (!lead && user.role === "lead") {
    await db.update(users).set({ role: "developer" }).where(eq(users.id, userId));
  }
}

function revalidateProject(projectId: string, slug?: string) {
  revalidatePath("/studio");
  revalidatePath("/studio/projects");
  revalidatePath(`/studio/projects/${projectId}`);
  revalidatePath("/");
  revalidatePath("/work");
  if (slug) revalidatePath(`/work/${slug}`);
}

async function notifyProjectCompleted(projectId: string, title: string) {
  await notifyProjectClients(projectId, {
    type: "project",
    title: `Project completed: ${title}`,
    body: "Your project has been marked completed. You can now leave a review in the portal.",
    href: `/portal/projects/${projectId}`,
  });
}

export async function createProject(formData: FormData) {
  const session = await requireFounder();

  const title = text(formData, "title");
  if (!title) redirect("/studio/projects/new?error=title");

  const slug = await uniqueProjectSlug(text(formData, "slug") || title);
  const status = statusValue(text(formData, "status"));
  const requestedLead = text(formData, "leadId");
  const leadId = isFounder(session.user.role) ? requestedLead : session.user.id;
  const resolvedImage = await resolveProjectImageFromForm(formData, null, text(formData, "image"));
  if (!resolvedImage.ok) redirect("/studio/projects/new?error=cover-upload");
  const image = resolvedImage.image;

  const [created] = await db
    .insert(projects)
    .values({
      slug,
      title,
      clientName: text(formData, "clientName"),
      clientId: isUuid(text(formData, "clientId")) ? text(formData, "clientId") : null,
      year: "",
      summary: text(formData, "summary"),
      image,
      liveUrl: text(formData, "liveUrl") || null,
      status,
      featured: checked(formData, "featured"),
      createdById: session.user.id,
    })
    .returning({ id: projects.id, title: projects.title });

  if (!created) redirect("/studio/projects/new?error=create");

  const technologyIds = formData.getAll("technologyIds").map(String).filter(isUuid);
  if (technologyIds.length > 0) {
    await db
      .insert(projectTechnologies)
      .values(technologyIds.map((technologyId) => ({ projectId: created.id, technologyId })))
      .onConflictDoNothing();
  }

  const memberIds = [...new Set(formData.getAll("memberIds").map(String).filter(isUuid))];
  const assignments: { userId: string; projectRole: "lead" | "developer" }[] = [];
  if (isUuid(leadId)) assignments.push({ userId: leadId, projectRole: "lead" });
  for (const userId of memberIds) {
    if (userId !== leadId) assignments.push({ userId, projectRole: "developer" });
  }

  if (assignments.length > 0) {
    await db.insert(projectMembers).values(
      assignments.map((assignment) => ({
        projectId: created.id,
        userId: assignment.userId,
        projectRole: assignment.projectRole,
        assignedById: session.user.id,
      })),
    );
    await Promise.all(
      assignments
        .filter((assignment) => assignment.projectRole === "lead")
        .map((assignment) => syncUserLeadRole(assignment.userId)),
    );

    await notifyUsers(
      [...new Set(assignments.map((assignment) => assignment.userId))],
      {
        type: "project",
        title: `Assigned to ${created.title}`,
        body:
          assignments.find((assignment) => assignment.userId === leadId)?.projectRole === "lead"
            ? "You are the project lead."
            : "You were added as a developer.",
        href: `/studio/projects/${created.id}`,
      },
    );
  }

  if (status === "published") {
    await sendProjectEmail(
      created.id,
      `Project published: ${created.title}`,
      `<p>${created.title} is now published on the website.</p>`,
    );
  }

  revalidateProject(created.id, slug);
  redirect(`/studio/projects/${created.id}?tab=edit`);
}

export async function updateProject(formData: FormData) {
  const projectId = text(formData, "projectId");
  await requireProjectManager(projectId);
  const [existing] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!existing) redirect("/studio/projects");

  const title = text(formData, "title") || existing.title;
  const slug = await uniqueProjectSlug(text(formData, "slug") || existing.slug, projectId);
  const resolvedImage = await resolveProjectImageFromForm(
    formData,
    existing.image,
    text(formData, "image"),
  );
  if (!resolvedImage.ok) {
    redirect(`/studio/projects/${projectId}?tab=edit&error=cover-upload`);
  }
  const image = resolvedImage.image;

  const [updated] = await db
    .update(projects)
    .set({
      title,
      slug,
      clientName: text(formData, "clientName"),
      clientId: isUuid(text(formData, "clientId")) ? text(formData, "clientId") : null,
      summary: text(formData, "summary"),
      image,
      liveUrl: text(formData, "liveUrl") || null,
      status: statusValue(text(formData, "status")),
      featured: checked(formData, "featured"),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning({ id: projects.id, slug: projects.slug, status: projects.status });

  const technologyIds = formData.getAll("technologyIds").map(String).filter(isUuid);
  await db.delete(projectTechnologies).where(eq(projectTechnologies.projectId, projectId));
  if (technologyIds.length > 0) {
    await db
      .insert(projectTechnologies)
      .values(technologyIds.map((technologyId) => ({ projectId, technologyId })))
      .onConflictDoNothing();
  }

  if (updated && existing.status !== "published" && updated.status === "published") {
    await sendProjectEmail(
      projectId,
      `Project published: ${title}`,
      `<p>${title} is now published on the website.</p>`,
    );
  }

  if (updated && existing.status !== "completed" && updated.status === "completed") {
    await notifyProjectCompleted(projectId, title);
    revalidatePath("/portal");
    revalidatePath(`/portal/projects/${projectId}`);
  }

  revalidateProject(projectId, updated?.slug);
  revalidatePath(`/work/${existing.slug}`);
  redirect(`/studio/projects/${projectId}?tab=edit`);
}

export async function assignProjectMember(formData: FormData) {
  const projectId = text(formData, "projectId");
  const session = await requireProjectManager(projectId);
  const userId = text(formData, "userId");
  const requestedRole = text(formData, "projectRole");
  // Leads can add developers to their project, but only founders can change
  // who leads it.
  const projectRole: "lead" | "developer" =
    requestedRole === "lead" && isFounder(session.user.role) ? "lead" : "developer";
  if (!isUuid(projectId) || !isUuid(userId)) redirect(`/studio/projects/${projectId}`);

  const [target] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!target || normalizeRole(target.role) === "client") {
    redirect(`/studio/projects/${projectId}?error=member`);
  }

  const title = await projectTitle(projectId);
  const previousLeads = await db
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.projectRole, "lead")));

  if (projectRole === "lead") {
    await db
      .update(projectMembers)
      .set({ projectRole: "developer" })
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.projectRole, "lead")));
  }

  await db
    .insert(projectMembers)
    .values({
      projectId,
      userId,
      projectRole,
      assignedById: session.user.id,
    })
    .onConflictDoUpdate({
      target: [projectMembers.projectId, projectMembers.userId],
      set: { projectRole, assignedById: session.user.id },
    });

  if (projectRole === "lead") {
    await syncUserLeadRole(userId);
    await Promise.all(
      previousLeads
        .filter((lead) => lead.userId !== userId)
        .map((lead) => syncUserLeadRole(lead.userId)),
    );
  }

  await notifyUsers([userId], {
    type: "project",
    title:
      projectRole === "lead"
        ? `You now lead ${title}`
        : `You were added to ${title}`,
    body:
      projectRole === "lead"
        ? "You have full control of this project and receive its email."
        : "You are assigned as a developer on this project.",
    href: `/studio/projects/${projectId}`,
  });

  if (projectRole === "lead" && target.email) {
    try {
      await sendEmail({
        to: target.email,
        subject: `You are now leading ${title}`,
        html: `<p>Hi ${target.name ?? "there"},</p><p>You now have full control of <strong>${title}</strong>. Project email will be routed to you.</p>`,
      });
    } catch (error) {
      console.error("[studio] Failed to email new lead", error);
    }
  }

  revalidateProject(projectId);
  redirect(`/studio/projects/${projectId}`);
}

export async function removeProjectMember(formData: FormData) {
  const projectId = text(formData, "projectId");
  await requireProjectManager(projectId);
  const userId = text(formData, "userId");
  const [removed] = await db
    .select({ projectRole: projectMembers.projectRole })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);
  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
  if (removed?.projectRole === "lead") await syncUserLeadRole(userId);
  revalidateProject(projectId);
  redirect(`/studio/projects/${projectId}`);
}

export async function setProjectLead(formData: FormData) {
  const projectId = text(formData, "projectId");
  const session = await requireFounder();
  const userId = text(formData, "userId");
  const title = await projectTitle(projectId);
  const previousLeads = await db
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.projectRole, "lead")));

  await db
    .update(projectMembers)
    .set({ projectRole: "developer" })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.projectRole, "lead")));

  await db
    .insert(projectMembers)
    .values({
      projectId,
      userId,
      projectRole: "lead",
      assignedById: session.user.id,
    })
    .onConflictDoUpdate({
      target: [projectMembers.projectId, projectMembers.userId],
      set: { projectRole: "lead", assignedById: session.user.id },
    });

  await syncUserLeadRole(userId);
  await Promise.all(
    previousLeads
      .filter((lead) => lead.userId !== userId)
      .map((lead) => syncUserLeadRole(lead.userId)),
  );
  const [target] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  await notifyUsers([userId], {
    type: "project",
    title: `You now lead ${title}`,
    body: "You have full control of this project and receive its email.",
    href: `/studio/projects/${projectId}`,
  });

  if (target?.email) {
    try {
      await sendEmail({
        to: target.email,
        subject: `You are now leading ${title}`,
        html: `<p>Hi ${target.name ?? "there"},</p><p>You now have full control of <strong>${title}</strong>. Project email will be routed to you.</p>`,
      });
    } catch (error) {
      console.error("[studio] Failed to email new lead", error);
    }
  }

  revalidateProject(projectId);
  redirect(`/studio/projects/${projectId}`);
}

export async function createProjectUpdate(formData: FormData) {
  const projectId = text(formData, "projectId");
  const session = await requireTeam();
  const [membership] = await db
    .select({ projectRole: projectMembers.projectRole })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!membership && !isFounder(session.user.role)) redirect(`/studio/projects/${projectId}`);

  const title = text(formData, "title");
  if (!title) redirect(`/studio/projects/${projectId}?error=update`);

  await db.insert(projectUpdates).values({
    projectId,
    authorId: session.user.id,
    title,
    body: text(formData, "body"),
    visibility: text(formData, "visibility") === "internal" ? "internal" : "client",
  });

  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));

  if (text(formData, "visibility") !== "internal") {
    await notifyProjectClients(projectId, {
      type: "project",
      title: `New update on ${await projectTitle(projectId)}`,
      body: title,
      href: `/portal/projects/${projectId}`,
    });
  }

  revalidateProject(projectId);
  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);
  redirect(`/studio/projects/${projectId}`);
}

export async function createTechnology(formData: FormData) {
  await requireFounder();
  const name = text(formData, "name");
  if (!name) redirect("/studio/technologies?error=name");

  const root = slugify(name) || "technology";
  let slug = root;
  let attempt = 1;
  while (true) {
    const [row] = await db
      .select({ id: technologies.id })
      .from(technologies)
      .where(eq(technologies.slug, slug))
      .limit(1);
    if (!row) break;
    attempt += 1;
    slug = `${root}-${attempt}`;
  }

  await db.insert(technologies).values({
    name,
    slug,
    category: text(formData, "category") || "General",
  });

  revalidatePath("/studio/technologies");
  redirect("/studio/technologies");
}

export async function assignUserTechnology(formData: FormData) {
  await requireFounder();
  const userId = text(formData, "userId");
  const technologyId = text(formData, "technologyId");
  const level = text(formData, "level") || "practicing";
  if (!isUuid(userId) || !isUuid(technologyId)) redirect("/studio/technologies");

  await db
    .insert(userTechnologies)
    .values({ userId, technologyId, level })
    .onConflictDoUpdate({
      target: [userTechnologies.userId, userTechnologies.technologyId],
      set: { level },
    });

  revalidatePath("/studio/technologies");
  revalidatePath(`/studio/team`);
  redirect("/studio/technologies");
}

export async function removeUserTechnology(formData: FormData) {
  await requireFounder();
  const userId = text(formData, "userId");
  const technologyId = text(formData, "technologyId");
  await db
    .delete(userTechnologies)
    .where(
      and(
        eq(userTechnologies.userId, userId),
        eq(userTechnologies.technologyId, technologyId),
      ),
    );
  revalidatePath("/studio/technologies");
  redirect("/studio/technologies");
}

export async function createTeamMember(formData: FormData) {
  const session = await requireFounder();
  const parsed = inviteSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email"),
    role: text(formData, "role") || "developer",
    title: text(formData, "title") || undefined,
  });
  if (!parsed.success || parsed.data.role === "client") {
    redirect("/studio/team?error=validation");
  }

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) redirect("/studio/team?error=exists");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  // Re-inviting the same address replaces the previous pending token.
  await db
    .delete(invites)
    .where(and(eq(invites.email, email), isNull(invites.acceptedAt)));
  await db.insert(invites).values({
    token,
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    title: parsed.data.title ?? null,
    expiresAt,
    invitedById: session.user.id,
  });

  let emailFailed = false;
  try {
    await sendInviteEmail({ email, token, role: parsed.data.role });
  } catch (error) {
    console.error("[invite] Failed to send team invitation", error);
    emailFailed = true;
  }

  revalidatePath("/studio/team");
  redirect(emailFailed ? "/studio/team?error=email" : "/studio/team?invited=1");
}

export async function updateUserRole(formData: FormData) {
  const session = await requireFounder();
  const userId = text(formData, "userId");
  const role = text(formData, "role");
  const allowed: UserRole[] = ["founder", "lead", "developer", "client"];
  if (!isUuid(userId) || !allowed.includes(role as UserRole)) redirect("/studio/team");
  if (userId === session.user.id) redirect("/studio/team?error=self");

  if (role !== "founder") {
    const founders = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.role, ["founder", "admin"]));
    if (founders.length <= 1 && founders.some((founder) => founder.id === userId)) {
      redirect("/studio/team?error=last-founder");
    }
  }

  await db.update(users).set({ role: role as UserRole }).where(eq(users.id, userId));
  revalidatePath("/studio/team");
  redirect("/studio/team");
}

export async function createReview(formData: FormData) {
  const session = await requireFounder();

  const quote = text(formData, "quote");
  if (!quote) redirect("/studio/reviews?error=quote");

  const source = ["upwork", "client", "manual", "google"].includes(text(formData, "source"))
    ? text(formData, "source")
    : "manual";

  await db.insert(reviews).values({
    quote,
    authorName: text(formData, "authorName") || "Client",
    authorRole: text(formData, "authorRole") || null,
    company: text(formData, "company") || null,
    projectTitle: text(formData, "projectTitle") || null,
    projectId: isUuid(text(formData, "projectId")) ? text(formData, "projectId") : null,
    rating: Math.min(5, Math.max(1, Number(text(formData, "rating")) || 5)),
    source,
    sourceUrl: text(formData, "sourceUrl") || null,
    period: text(formData, "period") || null,
    status: "approved",
    createdById: session.user.id,
  });

  revalidatePath("/studio/reviews");
  revalidatePath("/");
  redirect("/studio/reviews");
}

export async function setReviewStatus(formData: FormData) {
  await requireFounder();
  const reviewId = text(formData, "reviewId");
  const status = text(formData, "status");
  if (!isUuid(reviewId) || !["pending", "approved", "hidden"].includes(status)) {
    redirect("/studio/reviews");
  }
  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));
  revalidatePath("/studio/reviews");
  revalidatePath("/");
  redirect("/studio/reviews");
}

export async function createClient(formData: FormData) {
  await requireFounder();
  const name = text(formData, "name");
  if (!name) redirect("/studio/clients?error=name");

  const root = slugify(name) || "client";
  let slug = root;
  let attempt = 1;
  while (true) {
    const [row] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.slug, slug))
      .limit(1);
    if (!row) break;
    attempt += 1;
    slug = `${root}-${attempt}`;
  }

  await db.insert(clients).values({
    name,
    slug,
    contactEmail: text(formData, "contactEmail") || null,
  });

  revalidatePath("/studio/clients");
  redirect("/studio/clients");
}

export async function addClientMember(formData: FormData) {
  const session = await requireFounder();
  const clientId = text(formData, "clientId");
  const parsed = clientInviteSchema.safeParse({ email: text(formData, "email") });
  if (!isUuid(clientId) || !parsed.success) redirect("/studio/clients?error=member");

  const [client] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);
  if (!client) redirect("/studio/clients?error=member");

  const email = parsed.data.email.toLowerCase();
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    // Re-inviting the same address replaces the previous pending token.
    await db
      .delete(invites)
      .where(and(eq(invites.email, email), isNull(invites.acceptedAt)));
    await db.insert(invites).values({
      token,
      email,
      role: "client",
      clientId,
      expiresAt,
      invitedById: session.user.id,
    });

    let emailFailed = false;
    try {
      await sendInviteEmail({
        email,
        token,
        role: "client",
        clientName: client.name,
      });
    } catch (error) {
      console.error("[invite] Failed to send client invitation", error);
      emailFailed = true;
    }

    revalidatePath("/studio/clients");
    redirect(emailFailed ? "/studio/clients?error=email" : "/studio/clients?invited=1");
  }

  await db
    .insert(clientMembers)
    .values({ clientId, userId: user.id, role: "member" })
    .onConflictDoNothing();

  if (checked(formData, "makeClient") && !isFounder(user.role)) {
    await db.update(users).set({ role: "client" }).where(eq(users.id, user.id));
  }

  revalidatePath("/studio/clients");
  redirect("/studio/clients");
}

/**
 * Public action called from `/accept-invite?token=...`. The token is the
 * authorisation; no session is required. It creates (or completes) the
 * account and marks every pending invite for that email as accepted.
 */
export async function acceptInvite(formData: FormData) {
  const token = text(formData, "token");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const parsed = acceptInviteSchema.safeParse({
    token,
    name: text(formData, "name"),
    password,
  });

  const errorUrl = (error: string) =>
    `/accept-invite?token=${encodeURIComponent(token)}&error=${error}`;

  if (!parsed.success) redirect(errorUrl("validation"));
  if (password !== confirmPassword) redirect(errorUrl("match"));

  const invite = await getInviteByToken(parsed.data.token);
  if (!invite) redirect("/accept-invite?error=expired");

  const email = invite.email.toLowerCase();
  const passwordHash = await hashPassword(parsed.data.password);
  const verifiedAt = new Date();

  const [account] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email,
      emailVerified: verifiedAt,
      passwordHash,
      role: invite.role,
      title: invite.title,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: parsed.data.name,
        emailVerified: verifiedAt,
        passwordHash,
        role: invite.role,
        title: invite.title,
      },
    })
    .returning({ id: users.id });

  if (!account) redirect("/accept-invite?error=expired");

  if (invite.clientId) {
    await db
      .insert(clientMembers)
      .values({ clientId: invite.clientId, userId: account.id, role: "member" })
      .onConflictDoNothing();
  }

  await db
    .update(invites)
    .set({ acceptedAt: verifiedAt })
    .where(and(eq(invites.email, email), isNull(invites.acceptedAt)));

  revalidatePath("/studio/team");
  revalidatePath("/studio/clients");
  redirect(`/login?email=${encodeURIComponent(email)}&invited=1`);
}

export async function markAllNotificationsRead() {
  const session = await requireSession();
  await markAllNotificationsReadForUser(session.user.id);
  revalidatePath("/studio/notifications");
  revalidatePath("/portal/notifications");
  redirect(isTeam(session.user.role) ? "/studio/notifications" : "/portal/notifications");
}

export async function createPortalRequest(formData: FormData) {
  const session = await requireSession();
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  if (!isUuid(projectId) || !title) redirect("/portal");

  const project = await getProjectById(projectId);
  if (!project) redirect("/portal");

  const clientIds = await db
    .select({ clientId: clientMembers.clientId })
    .from(clientMembers)
    .where(eq(clientMembers.userId, session.user.id));
  const allowed = clientIds.some((row) => row.clientId === project.project.clientId);
  if (!allowed) redirect("/portal");

  await db.insert(projectRequests).values({
    projectId,
    clientId: project.project.clientId,
    createdById: session.user.id,
    title,
    description: text(formData, "description"),
    type: text(formData, "type") === "change" ? "change" : "request",
    priority: ["low", "normal", "high", "urgent"].includes(text(formData, "priority"))
      ? text(formData, "priority")
      : "normal",
  });

  await notifyProject(projectId, {
    type: "request",
    title: `New client request: ${title}`,
    body: text(formData, "description").slice(0, 200),
    href: `/studio/projects/${projectId}`,
  });

  await sendProjectEmail(
    projectId,
    `Client request: ${title}`,
    `<h1>New client request</h1><p><strong>${title}</strong></p><p style="white-space: pre-wrap">${text(formData, "description")}</p>`,
    session.user.email ?? undefined,
  );

  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/studio/projects/${projectId}`);
  redirect(`/portal/projects/${projectId}`);
}

export async function setProjectRequestStatus(formData: FormData) {
  const projectId = text(formData, "projectId");
  await requireProjectManager(projectId);
  const requestId = text(formData, "requestId");
  const status = text(formData, "status");
  const resolutionNote = text(formData, "resolutionNote");
  if (!isUuid(requestId) || !["open", "completed", "rejected"].includes(status)) {
    redirect(`/studio/projects/${projectId}`);
  }
  if (status === "rejected" && !resolutionNote) {
    redirect(`/studio/projects/${projectId}?error=request-reason`);
  }

  const [request] = await db
    .select({
      id: projectRequests.id,
      title: projectRequests.title,
      status: projectRequests.status,
    })
    .from(projectRequests)
    .where(and(eq(projectRequests.id, requestId), eq(projectRequests.projectId, projectId)))
    .limit(1);
  if (!request) redirect(`/studio/projects/${projectId}`);

  if (status === "open" && request.status === "completed") {
    redirect(`/studio/projects/${projectId}?tab=requests`);
  }

  const resolved = status === "completed" || status === "rejected";
  await db
    .update(projectRequests)
    .set({
      status,
      resolutionNote: resolved ? resolutionNote || null : null,
      resolvedAt: resolved ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(projectRequests.id, requestId), eq(projectRequests.projectId, projectId)));

  if (request.status !== status && resolved) {
    await notifyProjectClients(projectId, {
      type: "request",
      title:
        status === "completed"
          ? `Request completed: ${request.title}`
          : `Request rejected: ${request.title}`,
      body: status === "completed" ? "Your request has been completed." : resolutionNote,
      href: `/portal/projects/${projectId}`,
    });
    revalidatePath("/portal/notifications");
  }

  revalidatePath(`/studio/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal");
  redirect(`/studio/projects/${projectId}`);
}

export async function createClientReview(formData: FormData) {
  const session = await requireSession();
  const projectId = text(formData, "projectId");
  const quote = text(formData, "quote");
  if (!isUuid(projectId) || !quote) redirect("/portal");

  const detail = await getPortalProject(projectId, session.user.id);
  if (!detail) redirect("/portal");
  if (detail.project.status !== "completed") {
    redirect(`/portal/projects/${projectId}`);
  }
  if (detail.review) redirect(`/portal/projects/${projectId}`);

  const rating = Math.min(5, Math.max(1, Number(text(formData, "rating")) || 5));

  await db.insert(reviews).values({
    quote,
    authorName: session.user.name ?? session.user.email ?? "Client",
    authorRole: "Client",
    company: detail.project.clientName || null,
    projectTitle: detail.project.title,
    projectId,
    clientId: detail.project.clientId,
    rating,
    source: "client",
    status: "pending",
    createdById: session.user.id,
  });

  await notifyFounders({
    type: "review",
    title: `New client review from ${session.user.name ?? session.user.email ?? "a client"}`,
    body: quote.slice(0, 160),
    href: "/studio/reviews",
  });

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/studio/reviews");
  redirect(`/portal/projects/${projectId}?review=submitted`);
}
