"use server";

import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "~/server/db";
import {
  contentEntries,
  type ContentEntry,
  type ContentKind,
} from "~/server/db/schema";
import type { ContentDocument } from "~/lib/content";
import { contentReadingTime } from "~/lib/content";

export type PublicContentSummary = {
  id: string;
  kind: ContentKind;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  isHomepage: boolean;
  showInNav: boolean;
  navLabel: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  readingMinutes: number;
};

export type CmsNavLink = {
  id: string;
  label: string;
  href: string;
};

function summarize(entry: ContentEntry): PublicContentSummary {
  const body = (entry.body ?? null) as ContentDocument | null;

  return {
    id: entry.id,
    kind: entry.kind,
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    coverImageUrl: entry.coverImageUrl,
    isHomepage: entry.isHomepage,
    showInNav: entry.showInNav,
    navLabel: entry.navLabel,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    readingMinutes: body ? contentReadingTime(body) : 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Studio                                                                      */
/* -------------------------------------------------------------------------- */

export async function listContentEntries(): Promise<ContentEntry[]> {
  return db
    .select()
    .from(contentEntries)
    .orderBy(desc(contentEntries.updatedAt));
}

export async function getContentEntry(
  id: string,
): Promise<ContentEntry | null> {
  const [row] = await db
    .select()
    .from(contentEntries)
    .where(eq(contentEntries.id, id))
    .limit(1);
  return row ?? null;
}

export async function contentSlugExists(
  kind: ContentKind,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: contentEntries.id })
    .from(contentEntries)
    .where(
      and(
        eq(contentEntries.kind, kind),
        eq(contentEntries.slug, slug),
        excludeId ? ne(contentEntries.id, excludeId) : undefined,
      ),
    )
    .limit(1);
  return !!row;
}

/* -------------------------------------------------------------------------- */
/* Public                                                                      */
/* -------------------------------------------------------------------------- */

const PUBLISHED = eq(contentEntries.status, "published");

export async function getPublishedEntry(
  kind: ContentKind,
  slug: string,
): Promise<ContentEntry | null> {
  const [row] = await db
    .select()
    .from(contentEntries)
    .where(
      and(
        PUBLISHED,
        eq(contentEntries.kind, kind),
        eq(contentEntries.slug, slug),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getPublishedHomepageEntry(): Promise<ContentEntry | null> {
  const [row] = await db
    .select()
    .from(contentEntries)
    .where(
      and(
        PUBLISHED,
        eq(contentEntries.kind, "page"),
        or(
          eq(contentEntries.isHomepage, true),
          eq(contentEntries.slug, "home"),
        ),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listPublishedNavPages(): Promise<CmsNavLink[]> {
  const rows = await db
    .select({
      id: contentEntries.id,
      slug: contentEntries.slug,
      title: contentEntries.title,
      navLabel: contentEntries.navLabel,
      isHomepage: contentEntries.isHomepage,
    })
    .from(contentEntries)
    .where(
      and(
        PUBLISHED,
        eq(contentEntries.kind, "page"),
        eq(contentEntries.showInNav, true),
        eq(contentEntries.isHomepage, false),
      ),
    )
    .orderBy(desc(contentEntries.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    label: row.navLabel?.trim() || row.title,
    href: `/${row.slug}`,
  }));
}

export async function listPublishedEntries(
  kind: ContentKind,
): Promise<PublicContentSummary[]> {
  const rows = await db
    .select()
    .from(contentEntries)
    .where(and(PUBLISHED, eq(contentEntries.kind, kind)))
    .orderBy(desc(contentEntries.publishedAt), desc(contentEntries.updatedAt));
  return rows.map(summarize);
}

/* -------------------------------------------------------------------------- */
/* Safe variants (public pages keep working if the DB is unavailable)          */
/* -------------------------------------------------------------------------- */

export async function getPublishedEntrySafe(
  kind: ContentKind,
  slug: string,
): Promise<ContentEntry | null> {
  try {
    return await getPublishedEntry(kind, slug);
  } catch {
    return null;
  }
}

export async function getPublishedHomepageEntrySafe(): Promise<ContentEntry | null> {
  try {
    return await getPublishedHomepageEntry();
  } catch {
    return null;
  }
}

export async function listPublishedNavPagesSafe(): Promise<CmsNavLink[]> {
  try {
    return await listPublishedNavPages();
  } catch {
    return [];
  }
}

export async function listPublishedEntriesSafe(
  kind: ContentKind,
): Promise<PublicContentSummary[]> {
  try {
    return await listPublishedEntries(kind);
  } catch {
    return [];
  }
}

export async function listPublishedContentSafe(): Promise<
  PublicContentSummary[]
> {
  try {
    const rows = await db
      .select()
      .from(contentEntries)
      .where(PUBLISHED)
      .orderBy(desc(contentEntries.publishedAt));
    return rows.map(summarize);
  } catch {
    return [];
  }
}
