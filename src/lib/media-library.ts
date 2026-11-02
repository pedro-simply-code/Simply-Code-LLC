/** Media library — content CMS uploads only (not profile avatars or project covers). */
export type MediaLibraryScope = "content";

export const MEDIA_LIBRARY_SCOPE_LABEL: Record<MediaLibraryScope, string> = {
  content: "Content",
};

export const CONTENT_MEDIA_MAX_BYTES = 8 * 1024 * 1024;

export const CONTENT_MEDIA_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif";

/** Returns an error message, or null if the file is allowed. */
export function contentMediaFileError(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose a PNG, JPG, WebP, or GIF image.";
  }
  if (file.size > CONTENT_MEDIA_MAX_BYTES) {
    return "Image must be 8 MB or smaller.";
  }
  return null;
}
