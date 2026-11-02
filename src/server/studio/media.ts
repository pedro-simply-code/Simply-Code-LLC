"use server";

import { and, desc, eq } from "drizzle-orm";
import { auth } from "~/lib/auth";
import { isUploadThingImageUrl } from "~/lib/project-image";
import { canManageContent } from "~/lib/roles";
import { db } from "~/server/db";
import { userUploadClaims } from "~/server/db/schema";

export type StudioMediaItem = {
  url: string;
  createdAt: Date;
};

/** Lists CMS content uploads for the cover picker (not team avatars or project files). */
export async function listStudioMedia(): Promise<StudioMediaItem[]> {
  const session = await auth();
  if (!session?.user?.id || !canManageContent(session.user.role)) {
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
      .limit(120);

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
