import type { ContentDocument } from "~/lib/content";

export type ContentMediaUsagePlace = "cover" | "body";

export type ContentMediaUsage = {
  entryId: string;
  title: string;
  kind: "page" | "post";
  slug: string;
  isHomepage: boolean;
  places: ContentMediaUsagePlace[];
};

function documentReferencesUrl(document: ContentDocument, url: string): boolean {
  const walk = (value: unknown): boolean => {
    if (value === url) return true;
    if (Array.isArray(value)) return value.some(walk);
    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>).some(walk);
    }
    return false;
  };
  return walk(document);
}

export function collectContentMediaUsages(
  entries: {
    id: string;
    title: string;
    kind: "page" | "post";
    slug: string;
    isHomepage: boolean;
    coverImageUrl: string | null;
    body: ContentDocument;
  }[],
  url: string,
): ContentMediaUsage[] {
  const usages: ContentMediaUsage[] = [];

  for (const entry of entries) {
    const places: ContentMediaUsagePlace[] = [];
    if (entry.coverImageUrl === url) places.push("cover");
    if (documentReferencesUrl(entry.body, url)) places.push("body");
    if (places.length === 0) continue;
    usages.push({
      entryId: entry.id,
      title: entry.title,
      kind: entry.kind,
      slug: entry.slug,
      isHomepage: entry.isHomepage,
      places,
    });
  }

  return usages;
}