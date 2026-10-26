import "server-only";

import { and, eq, gte, inArray } from "drizzle-orm";
import { isUploadThingFileUrl } from "~/lib/message-attachments";
import { isUploadThingImageUrl } from "~/lib/project-image";
import type { MessageAttachment } from "~/lib/message-attachments";
import { db } from "~/server/db";
import { userUploadClaims } from "~/server/db/schema";

const CLAIM_TTL_MS = 48 * 60 * 60 * 1000;

export type UploadClaimKind =
  "avatar" | "message_attachment" | "project_deliverable";

function isClaimableUploadUrl(url: string, kind: UploadClaimKind): boolean {
  if (kind === "avatar") return isUploadThingImageUrl(url);
  return isUploadThingFileUrl(url);
}

export async function registerUserUploadClaim(
  userId: string,
  url: string,
  kind: UploadClaimKind,
): Promise<void> {
  if (!isClaimableUploadUrl(url, kind)) return;

  await db
    .insert(userUploadClaims)
    .values({ userId, url, kind })
    .onConflictDoNothing({ target: userUploadClaims.url });
}

export async function userOwnsUploadClaim(
  userId: string,
  url: string,
  kind?: UploadClaimKind,
): Promise<boolean> {
  if (kind === "avatar" && !isUploadThingImageUrl(url)) return false;
  if (kind !== "avatar" && !isUploadThingFileUrl(url)) return false;
  if (!kind && !isUploadThingFileUrl(url) && !isUploadThingImageUrl(url))
    return false;

  const minCreated = new Date(Date.now() - CLAIM_TTL_MS);
  const conditions = [
    eq(userUploadClaims.userId, userId),
    eq(userUploadClaims.url, url),
    gte(userUploadClaims.createdAt, minCreated),
  ];
  if (kind) {
    conditions.push(eq(userUploadClaims.kind, kind));
  }

  const [row] = await db
    .select({ id: userUploadClaims.id })
    .from(userUploadClaims)
    .where(and(...conditions))
    .limit(1);

  return !!row;
}

export async function releaseUserUploadClaims(
  userId: string,
  urls: string[],
): Promise<void> {
  const unique = [
    ...new Set(
      urls.filter(
        (url) => isUploadThingFileUrl(url) || isUploadThingImageUrl(url),
      ),
    ),
  ];
  if (unique.length === 0) return;

  await db
    .delete(userUploadClaims)
    .where(
      and(
        eq(userUploadClaims.userId, userId),
        inArray(userUploadClaims.url, unique),
      ),
    );
}

export async function filterAttachmentsWithClaims(
  userId: string,
  attachments: MessageAttachment[],
  kind: UploadClaimKind = "message_attachment",
): Promise<MessageAttachment[]> {
  const result: MessageAttachment[] = [];
  for (const item of attachments) {
    if (await userOwnsUploadClaim(userId, item.url, kind)) {
      result.push(item);
    }
  }
  return result;
}

export async function assertUserCanDiscardUpload(
  userId: string,
  url: string,
): Promise<boolean> {
  return userOwnsUploadClaim(userId, url);
}
