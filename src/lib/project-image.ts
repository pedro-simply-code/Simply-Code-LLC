/** File key for UTApi.deleteFiles, parsed from a public UploadThing / utfs URL. */
export function uploadThingFileKeyFromUrl(url: string): string | null {
  if (!isUploadThingImageUrl(url)) return null;
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/\/f\/(.+)$/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function isUploadThingImageUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  try {
    const { hostname } = new URL(url);
    if (hostname === "utfs.io" || hostname.endsWith(".utfs.io")) return true;
    if (hostname.endsWith(".ufs.sh") || hostname === "ufs.sh") return true;
    if (hostname.endsWith(".uploadthing.com") || hostname === "uploadthing.com")
      return true;
    return false;
  } catch {
    return false;
  }
}

/** Skip Next.js optimizer for user-uploaded / external profile photos. */
export function userProfileImageUnoptimized(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("/")) return true;
  if (isUploadThingImageUrl(src)) return true;
  return src.includes("googleusercontent.com");
}

export function isStoredProjectImageUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  return isUploadThingImageUrl(url);
}

/** Absolute URL for metadata / JSON-LD (supports legacy `/public` paths). */
export function projectImageAbsolute(image: string, siteUrl: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const base = siteUrl.replace(/\/$/, "");
  return image.startsWith("/") ? `${base}${image}` : `${base}/${image}`;
}

export function projectImageFromForm(
  value: string,
  existing: string | null,
): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (isStoredProjectImageUrl(raw)) return raw;
  return existing;
}
