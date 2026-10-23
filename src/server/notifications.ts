import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  clientMembers,
  notifications,
  projectMembers,
  projects,
  users,
} from "~/server/db/schema";
import { sendEmail } from "~/server/email/sendEmail";
import { getProjectEmailRecipients } from "~/server/studio/queries";
import { normalizeRole } from "~/lib/roles";

type NotificationInput = {
  type: "contact" | "project" | "review" | "request" | "system";
  title: string;
  body?: string;
  href?: string;
};

export async function notifyUsers(userIds: string[], input: NotificationInput) {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return;

  await db.insert(notifications).values(
    unique.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      href: input.href,
    })),
  );
}

export async function notifyFounders(input: NotificationInput) {
  const founders = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, ["founder", "admin"]));

  await notifyUsers(
    founders.map((founder) => founder.id),
    input,
  );
}

export async function getProjectMemberIds(projectId: string) {
  const rows = await db
    .select({
      userId: projectMembers.userId,
      projectRole: projectMembers.projectRole,
      role: users.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId));
  return rows;
}

/**
 * Project-specific notifications go to the project lead. If a project has no
 * lead, a lead-team member working on it is next, then the founders. Plain
 * developers never receive project email.
 */
export async function notifyProject(projectId: string, input: NotificationInput) {
  const members = await getProjectMemberIds(projectId);
  const leads = members.filter((member) => member.projectRole === "lead");
  if (leads.length > 0) {
    await notifyUsers(
      leads.map((lead) => lead.userId),
      input,
    );
    return;
  }

  const teamLeads = members.filter((member) => normalizeRole(member.role) === "lead");
  if (teamLeads.length > 0) {
    await notifyUsers(
      teamLeads.map((lead) => lead.userId),
      input,
    );
    return;
  }

  await notifyFounders(input);
}

export async function sendProjectEmail(
  projectId: string,
  subject: string,
  html: string,
  replyTo?: string,
) {
  const recipients = await getProjectEmailRecipients(projectId);
  if (recipients.length === 0) return;

  await Promise.all(
    recipients.map(async (recipient) => {
      try {
        await sendEmail({
          to: recipient.email!,
          subject,
          html,
          replyTo,
        });
      } catch (error) {
        console.error("[project-email] Failed to send", {
          projectId,
          to: recipient.email,
          error,
        });
      }
    }),
  );
}

export async function notifyProjectClients(projectId: string, input: NotificationInput) {
  const [project] = await db
    .select({ clientId: projects.clientId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project?.clientId) return;

  const members = await db
    .select({ userId: clientMembers.userId })
    .from(clientMembers)
    .where(and(eq(clientMembers.clientId, project.clientId)));

  await notifyUsers(
    members.map((member) => member.userId),
    input,
  );
}

export async function notifyProjectRequest(projectId: string, title: string, body: string) {
  await notifyProject(projectId, {
    type: "request",
    title: `New client request: ${title}`,
    body,
    href: `/studio/projects/${projectId}`,
  });
}
