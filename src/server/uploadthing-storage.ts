import "server-only";

import { UTApi } from "uploadthing/server";
import { env } from "~/env";
import {
  isStoredProjectImageUrl,
  isUploadThingImageUrl,
  projectImageFromForm,
  uploadThingFileKeyFromUrl,
} from "~/lib/project-image";

let utapi: UTApi | null = null;

function getUtapi(): UTApi | null {
  if (!env.UPLOADTHING_TOKEN) return null;
  utapi ??= new UTApi();
  return utapi;
}

const MAX_COVER_BYTES = 8 * 1024 * 1024;
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export async function uploadProjectCoverFile(file: File): Promise<string | null> {
  return uploadImageFile(file, MAX_COVER_BYTES, "project-cover");
}

export async function uploadUserAvatarFile(file: File): Promise<string | null> {
  return uploadImageFile(file, MAX_AVATAR_BYTES, "user-avatar");
}

async function deleteUploadThingFile(url: string | null | undefined, logTag: string): Promise<void> {
  if (!url || !isUploadThingImageUrl(url)) return;

  const api = getUtapi();
  if (!api) {
    console.error(`[${logTag}] UPLOADTHING_TOKEN is not configured; cannot delete old file`);
    return;
  }

  const key = uploadThingFileKeyFromUrl(url);
  if (!key) {
    console.error(`[${logTag}] Could not parse UploadThing file key from URL`, url);
    return;
  }

  try {
    const result = await api.deleteFiles(key);
    if (!result.success) {
      console.error(`[${logTag}] UploadThing delete failed`, { key, result });
    }
  } catch (error) {
    console.error(`[${logTag}] UploadThing delete error`, error);
  }
}

async function replaceStoredUpload(
  previous: string | null | undefined,
  next: string | null | undefined,
  logTag: string,
): Promise<void> {
  if (!previous || previous === next) return;
  await deleteUploadThingFile(previous, logTag);
}

async function uploadImageFile(file: File, maxBytes: number, logTag: string): Promise<string | null> {
  const api = getUtapi();
  if (!api) {
    console.error(`[${logTag}] UPLOADTHING_TOKEN is not configured`);
    return null;
  }

  if (!file.type.startsWith("image/")) {
    console.error(`[${logTag}] Invalid file type`, file.type);
    return null;
  }

  if (file.size > maxBytes) {
    console.error(`[${logTag}] File too large`, file.size);
    return null;
  }

  const result = await api.uploadFiles(file);
  if (result.error || !result.data) {
    console.error(`[${logTag}] Upload failed`, result.error);
    return null;
  }

  const url = result.data.ufsUrl ?? result.data.url;
  if (!url) return null;
  if (isStoredProjectImageUrl(url) || url.startsWith("https://")) return url;
  return null;
}

export type ResolvedProjectImage =
  | { ok: true; image: string | null }
  | { ok: false; reason: "upload-failed" };

export async function resolveProjectImageFromForm(
  formData: FormData,
  existing: string | null,
  imageField: string,
): Promise<ResolvedProjectImage> {
  const coverFile = formData.get("coverFile");
  if (coverFile instanceof File && coverFile.size > 0) {
    const uploaded = await uploadProjectCoverFile(coverFile);
    if (!uploaded) return { ok: false, reason: "upload-failed" };
    await replaceStoredUpload(existing, uploaded, "project-cover");
    return { ok: true, image: uploaded };
  }

  const image = projectImageFromForm(imageField, existing);
  await replaceStoredUpload(existing, image, "project-cover");
  return { ok: true, image };
}

export type ResolvedUserAvatar =
  | { ok: true; image: string | null }
  | { ok: false; reason: "upload-failed" };

export async function resolveUserAvatarFromForm(
  formData: FormData,
  existing: string | null,
  imageField: string,
): Promise<ResolvedUserAvatar> {
  const avatarFile = formData.get("avatarFile");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const uploaded = await uploadUserAvatarFile(avatarFile);
    if (!uploaded) return { ok: false, reason: "upload-failed" };
    await replaceStoredUpload(existing, uploaded, "user-avatar");
    return { ok: true, image: uploaded };
  }

  const image = projectImageFromForm(imageField, existing);
  await replaceStoredUpload(existing, image, "user-avatar");
  return { ok: true, image };
}
