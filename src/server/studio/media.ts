"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/lib/auth";
import type { ContentDocument } from "~/lib/content";
import { isUploadThingImageUrl } from "~/lib/project-image";
import { canManageContent } from "~/lib/roles";
import { db } from "~/server/db";
import { contentEntries, userUploadClaims } from "~/server/db/schema";
import {
  collectContentMediaUsages,
  type ContentMediaUsage,
} from "~/server/studio/content-media-usages";
import { discardUploadThingImageUrl } from "~/server/uploadthing-storage";

export type StudioMediaItem = {
  url: string;
  createdAt: Date;
};

export type DeleteContentMediaResult =
  | { ok: true }
  | { ok: false; reason: "forbidden" | "not-found" | "in-use"; usages?: ContentMediaUsage[] };

export type { ContentMediaUsage };

async function requireContentMediaManager() {
  const session = await auth();
  if (!session?.user?.id || !canManageContent(session.user.role)) {
    return null;
  }
  return session;
}

async function loadEntriesForUsageScan() {
  return db
    .select({
      id: contentEntries.id,
      title: contentEntries.title,
      kind: contentEntries.kind,
      slug: contentEntries.slug,
      isHomepage: contentEntries.isHomepage,
      coverImageUrl: contentEntries.coverImageUrl,
      body: contentEntries.body,
    })
    .from(contentEntries);
}

export async function getContentMediaUsages(
  url: string,
): Promise<ContentMediaUsage[]> {
  const session = await requireContentMediaManager();
  if (!session || !url.trim() || !(await contentMediaUrlInLibrary(url))) {
    return [];
  }

  try {
    const entries = await loadEntriesForUsageScan();
    return collectContentMediaUsages(
      entries.map((row) => ({
        ...row,
        body: row.body as ContentDocument,
      })),
      url,
    );
  } catch (error) {
    console.error("[getContentMediaUsages]", error);
    return [];
  }
}

export async function deleteContentMedia(url: string): Promise<DeleteContentMediaResult> {
  const session = await requireContentMediaManager();
  if (!session) return { ok: false, reason: "forbidden" };

  const trimmed = url.trim();
  if (!trimmed || !isUploadThingImageUrl(trimmed)) {
    return { ok: false, reason: "not-found" };
  }

  const inLibrary = await contentMediaUrlInLibrary(trimmed);
  if (!inLibrary) return { ok: false, reason: "not-found" };

  const usages = await getContentMediaUsages(trimmed);
  if (usages.length > 0) {
    return { ok: false, reason: "in-use", usages };
  }

  try {
    await db
      .delete(userUploadClaims)
      .where(
        and(
          eq(userUploadClaims.url, trimmed),
          eq(userUploadClaims.kind, "content_media"),
        ),
      );
    await discardUploadThingImageUrl(trimmed, "content-media");
    revalidatePath("/studio/content/media");
    return { ok: true };
  } catch (error) {
    console.error("[deleteContentMedia]", error);
    return { ok: false, reason: "not-found" };
  }
}

/** Lists CMS content uploads for the cover picker (not team avatars or project files). */
export async function listStudioMedia(): Promise<StudioMediaItem[]> {
  const session = await requireContentMediaManager();
  if (!session) {
    return [];
  }

  try {
    const rows = await db
      .select({
        url: userUploadClaims.url,
        createdAt: userUploadClaims.createdAt,
      })
      .from(userUploadClaims)
      .where(eq(userUploadClaims.kind, "content_media"))
      .orderBy(desc(userUploadClaims.createdAt))
      .limit(400);

    return rows;
  } catch (error) {
    console.error("[listStudioMedia]", error);
    return [];
  }
}

export async function contentMediaUrlInLibrary(url: string): Promise<boolean> {
  if (!isUploadThingImageUrl(url)) return false;

  try {
    const [row] = await db
      .select({ id: userUploadClaims.id })
      .from(userUploadClaims)
      .where(
        and(
          eq(userUploadClaims.url, url),
          eq(userUploadClaims.kind, "content_media"),
        ),
      )
      .limit(1);

    return !!row;
  } catch (error) {
    console.error("[contentMediaUrlInLibrary]", error);
    return false;
  }
}
