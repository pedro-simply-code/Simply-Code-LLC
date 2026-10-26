import "server-only";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { env } from "~/env";
import { isFounder } from "~/lib/roles";
import { slugify } from "~/lib/slug";
import { db } from "~/server/db";
import { projectMembers, projects, users, type UserRole } from "~/server/db/schema";
import { notifyProjectClients, withProjectEntity } from "~/server/notifications";

export function formText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function formChecked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function inviteLink(token: string): string {
  const base = env.AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL;
  const url = new URL("/accept-invite", base);
  url.searchParams.set("token", token);
  return url.toString();
}

export function escapeHtml(value: string): string {
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

export function projectStatusValue(value: string): "draft" | "published" | "completed" {
  if (value === "published") return "published";
  if (value === "completed") return "completed";
  return "draft";
}

export async function fetchProjectTitle(projectId: string): Promise<string> {
  const [row] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return row?.title ?? "Project";
}

export async function uniqueProjectSlug(base: string, excludeId?: string): Promise<string> {
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

export async function syncUserLeadRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user || isFounder(user.role)) return;

  const [lead] = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(and(eq(projectMembers.userId, userId), eq(projectMembers.projectRole, "lead")))
    .limit(1);

  if (lead && (user.role === "developer" || user.role === "user")) {
    await db.update(users).set({ role: "lead" }).where(eq(users.id, userId));
  }
  if (!lead && user.role === "lead") {
    await db.update(users).set({ role: "developer" }).where(eq(users.id, userId));
  }
}

export function revalidateProjectPaths(projectId: string, slug?: string) {
  revalidatePath("/studio");
  revalidatePath("/studio/projects");
  revalidatePath(`/studio/projects/${projectId}`);
  revalidatePath("/");
  revalidatePath("/work");
  updateTag("public-projects");
  if (slug) revalidatePath(`/work/${slug}`);
}

export async function notifyProjectCompleted(projectId: string, title: string) {
  await notifyProjectClients(
    projectId,
    withProjectEntity(projectId, {
      type: "project",
      title: `Project completed: ${title}`,
      body: "Your project has been marked completed. You can now leave a review in the portal.",
      href: `/portal/projects/${projectId}`,
      projectTitle: title,
    }),
  );
}

export function inviteEmailHtml(input: {
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
