"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  contentHref,
  isContentKind,
  isContentStatus,
  parseContentDocument,
} from "~/lib/content";
import { slugify } from "~/lib/slug";
import { requireContentManager } from "~/server/authz";
import { db } from "~/server/db";
import { contentEntries } from "~/server/db/schema";
import { contentSlugExists, getContentEntry } from "~/server/content/queries";
import { resolveContentCoverFromForm } from "~/server/uploadthing-storage";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function revalidateContent(slug?: string, kind?: "page" | "post") {
  revalidatePath("/studio/content");
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug && kind) {
    revalidatePath(contentHref(kind, slug));
    if (kind === "post") revalidatePath("/blog");
  }
}

export async function createContentEntry(formData: FormData): Promise<void> {
  const session = await requireContentManager();

  const kind = field(formData, "kind");
  const title = field(formData, "title").trim();
  const slug = slugify(field(formData, "slug") || title);
  const excerpt = field(formData, "excerpt").trim();
  const status = field(formData, "status");
  const body = parseContentDocument(field(formData, "body"));

  if (!isContentKind(kind)) {
    redirect("/studio/content/new?error=kind");
  }
  if (!title) redirect("/studio/content/new?error=title");
  if (!slug) redirect("/studio/content/new?error=slug");
  if (!isContentStatus(status)) {
    redirect("/studio/content/new?error=status");
  }
  if (!body) redirect("/studio/content/new?error=body");
  if (await contentSlugExists(kind, slug)) {
    redirect("/studio/content/new?error=duplicate");
  }

  const resolvedCover = await resolveContentCoverFromForm(
    formData,
    null,
    field(formData, "coverImageUrl").trim(),
  );
  if (!resolvedCover.ok) redirect("/studio/content/new?error=cover");

  const [row] = await db
    .insert(contentEntries)
    .values({
      kind,
      slug,
      title,
      excerpt,
      coverImageUrl: resolvedCover.image,
      status,
      body,
      authorId: session.user.id,
      publishedAt: status === "published" ? new Date() : null,
    })
    .returning({ id: contentEntries.id });

  revalidateContent(slug, kind);

  if (!row) redirect("/studio/content");
  redirect(`/studio/content/${row.id}?created=1`);
}

export async function saveContentEntry(formData: FormData): Promise<void> {
  await requireContentManager();

  const id = field(formData, "id");
  if (!UUID.test(id)) redirect("/studio/content");

  const existing = await getContentEntry(id);
  if (!existing) redirect("/studio/content");

  const kind = field(formData, "kind");
  const title = field(formData, "title").trim();
  const slug = slugify(field(formData, "slug") || title);
  const excerpt = field(formData, "excerpt").trim();
  const status = field(formData, "status");
  const body = parseContentDocument(field(formData, "body"));

  if (!isContentKind(kind)) {
    redirect(`/studio/content/${id}?error=kind`);
  }
  if (!title) redirect(`/studio/content/${id}?error=title`);
  if (!slug) redirect(`/studio/content/${id}?error=slug`);
  if (!isContentStatus(status)) {
    redirect(`/studio/content/${id}?error=status`);
  }
  if (!body) redirect(`/studio/content/${id}?error=body`);
  if (await contentSlugExists(kind, slug, id)) {
    redirect(`/studio/content/${id}?error=duplicate`);
  }

  const resolvedCover = await resolveContentCoverFromForm(
    formData,
    existing.coverImageUrl,
    field(formData, "coverImageUrl").trim(),
  );
  if (!resolvedCover.ok) redirect(`/studio/content/${id}?error=cover`);

  const publishedAt =
    status === "published"
      ? (existing.publishedAt ?? new Date())
      : existing.publishedAt;

  await db
    .update(contentEntries)
    .set({
      kind,
      slug,
      title,
      excerpt,
      coverImageUrl: resolvedCover.image,
      status,
      body,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(contentEntries.id, id));

  revalidateContent(existing.slug, existing.kind);
  revalidatePath(`/studio/content/${id}`);
  revalidateContent(slug, kind);

  redirect(`/studio/content/${id}?saved=1`);
}

export async function deleteContentEntry(formData: FormData): Promise<void> {
  await requireContentManager();

  const id = field(formData, "id");
  if (!UUID.test(id)) redirect("/studio/content");

  const existing = await getContentEntry(id);
  if (!existing) redirect("/studio/content");

  await db.delete(contentEntries).where(eq(contentEntries.id, id));

  revalidateContent(existing.slug, existing.kind);
  redirect("/studio/content?deleted=1");
}
