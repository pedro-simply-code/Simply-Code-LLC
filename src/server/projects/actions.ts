"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseMessageAttachmentsFromForm } from "~/lib/message-attachments";
import {
  canPublishClientVisibleUpdate,
  requireProjectManager,
  requireProjectTeamMember,
} from "~/server/authz";
import { logAuditEvent } from "~/server/audit/log";
import { db } from "~/server/db";
import {
  projectDeliverables,
  projectMembers,
  projectMilestones,
  projects,
} from "~/server/db/schema";
import { notifyProjectClients, withProjectEntity } from "~/server/notifications";
import {
  filterAttachmentsWithClaims,
  releaseUserUploadClaims,
} from "~/server/uploads/claims";
import { fetchProjectTitle, formText, revalidateProjectPaths } from "~/server/studio/action-helpers";
import { isUuid } from "~/server/studio/queries";

function milestoneStatus(value: string): "pending" | "in_progress" | "completed" {
  if (value === "in_progress") return "in_progress";
  if (value === "completed") return "completed";
  return "pending";
}

export async function createProjectMilestone(formData: FormData) {
  const projectId = formText(formData, "projectId");
  await requireProjectTeamMember(projectId);

  const title = formText(formData, "title");
  if (!title) redirect(`/studio/projects/${projectId}?tab=milestones&error=title`);

  const [orderRow] = await db
    .select({ maxOrder: max(projectMilestones.sortOrder) })
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));

  const sortOrder = (orderRow?.maxOrder ?? -1) + 1;
  const targetRaw = formText(formData, "targetDate");

  await db.insert(projectMilestones).values({
    projectId,
    title,
    description: formText(formData, "description"),
    sortOrder,
    targetDate: targetRaw ? new Date(targetRaw) : null,
  });

  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidateProjectPaths(projectId);
  redirect(`/studio/projects/${projectId}?tab=milestones`);
}

export async function updateProjectMilestone(formData: FormData) {
  const projectId = formText(formData, "projectId");
  const session = await requireProjectTeamMember(projectId);

  const milestoneId = formText(formData, "milestoneId");
  if (!isUuid(milestoneId)) redirect(`/studio/projects/${projectId}?tab=milestones`);

  const status = milestoneStatus(formText(formData, "status"));
  const completedAt = status === "completed" ? new Date() : null;
  const title = formText(formData, "title");

  await db
    .update(projectMilestones)
    .set({
      ...(title ? { title } : {}),
      description: formText(formData, "description"),
      status,
      completedAt,
    })
    .where(and(eq(projectMilestones.id, milestoneId), eq(projectMilestones.projectId, projectId)));

  if (status === "completed") {
    const name = await fetchProjectTitle(projectId);
    await notifyProjectClients(
      projectId,
      withProjectEntity(projectId, {
        type: "project",
        title: `Milestone completed on ${name}`,
        body: title || "Milestone completed",
        href: `/portal/projects/${projectId}?tab=activity`,
        projectTitle: name,
      }),
    );
    await logAuditEvent({
      actorUserId: session.user.id,
      action: "project.milestone_completed",
      entityType: "project",
      entityId: projectId,
      metadata: { milestoneId },
    });
  }

  revalidateProjectPaths(projectId);
  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);
  redirect(`/studio/projects/${projectId}?tab=milestones`);
}

export async function deleteProjectMilestone(formData: FormData) {
  const projectId = formText(formData, "projectId");
  const session = await requireProjectManager(projectId);
  const milestoneId = formText(formData, "milestoneId");
  if (!isUuid(milestoneId)) redirect(`/studio/projects/${projectId}?tab=milestones`);

  await db
    .delete(projectMilestones)
    .where(and(eq(projectMilestones.id, milestoneId), eq(projectMilestones.projectId, projectId)));

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "project.milestone_deleted",
    entityType: "project",
    entityId: projectId,
    metadata: { milestoneId },
  });

  revalidateProjectPaths(projectId);
  redirect(`/studio/projects/${projectId}?tab=milestones`);
}

export async function addProjectDeliverable(formData: FormData) {
  const projectId = formText(formData, "projectId");
  const session = await requireProjectTeamMember(projectId);

  const title = formText(formData, "title");
  const files = await filterAttachmentsWithClaims(
    session.user.id,
    parseMessageAttachmentsFromForm(formData),
    "project_deliverable",
  );
  const file = files[0];
  if (!title || !file) {
    redirect(`/studio/projects/${projectId}?tab=deliverables&error=file`);
  }

  const visibility =
    formText(formData, "visibility") === "internal" ? "internal" : ("client" as const);

  const [membership] = await db
    .select({ projectRole: projectMembers.projectRole })
    .from(projectMembers)
    .where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, session.user.id)),
    )
    .limit(1);

  if (
    visibility === "client" &&
    !canPublishClientVisibleUpdate(
      session.user.role,
      membership
        ? { projectRole: membership.projectRole === "lead" ? "lead" : "developer" }
        : null,
    )
  ) {
    redirect(`/studio/projects/${projectId}?tab=deliverables&error=visibility`);
  }

  const [created] = await db
    .insert(projectDeliverables)
    .values({
      projectId,
      title,
      description: formText(formData, "description"),
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.contentType,
      visibility,
      uploadedById: session.user.id,
    })
    .returning({ id: projectDeliverables.id });

  await releaseUserUploadClaims(session.user.id, [file.url]);

  if (visibility === "client") {
    const name = await fetchProjectTitle(projectId);
    await notifyProjectClients(
      projectId,
      withProjectEntity(projectId, {
        type: "project",
        title: `New deliverable on ${name}`,
        body: title,
        href: `/portal/projects/${projectId}?tab=deliverables`,
        projectTitle: name,
      }),
    );
  }

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "project.deliverable_added",
    entityType: "project",
    entityId: projectId,
    metadata: { deliverableId: created?.id, visibility },
  });

  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidateProjectPaths(projectId);
  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);
  redirect(`/studio/projects/${projectId}?tab=deliverables`);
}

export async function removeProjectDeliverable(formData: FormData) {
  const projectId = formText(formData, "projectId");
  const session = await requireProjectManager(projectId);
  const deliverableId = formText(formData, "deliverableId");
  if (!isUuid(deliverableId)) redirect(`/studio/projects/${projectId}?tab=deliverables`);

  await db
    .delete(projectDeliverables)
    .where(
      and(eq(projectDeliverables.id, deliverableId), eq(projectDeliverables.projectId, projectId)),
    );

  await logAuditEvent({
    actorUserId: session.user.id,
    action: "project.deliverable_removed",
    entityType: "project",
    entityId: projectId,
    metadata: { deliverableId },
  });

  revalidateProjectPaths(projectId);
  revalidatePath(`/portal/projects/${projectId}`);
  redirect(`/studio/projects/${projectId}?tab=deliverables`);
}
