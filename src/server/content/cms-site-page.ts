import "server-only";

import type { ContentEntry } from "~/server/db/schema";
import { getPublishedEntrySafe } from "~/server/content/queries";

/** Static App Router paths that a published CMS page can replace (same slug). */
export const CMS_OVERRIDABLE_STATIC_SLUGS = [
  "work",
  "services",
  "about",
  "contact",
  "faq",
] as const;

export type CmsOverridableStaticSlug =
  (typeof CMS_OVERRIDABLE_STATIC_SLUGS)[number];

export function isCmsOverridableStaticSlug(
  slug: string,
): slug is CmsOverridableStaticSlug {
  return (CMS_OVERRIDABLE_STATIC_SLUGS as readonly string[]).includes(slug);
}

/**
 * When a page is published at `/{slug}` (not homepage), it replaces the
 * matching static `(site)/{slug}/page.tsx` shell.
 */
export async function getPublishedCmsPageOverride(
  slug: CmsOverridableStaticSlug,
): Promise<ContentEntry | null> {
  const entry = await getPublishedEntrySafe("page", slug);
  if (!entry || entry.isHomepage) return null;
  return entry;
}
