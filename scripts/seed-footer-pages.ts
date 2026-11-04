/**
 * Seeds or updates CMS pages for FAQ, Terms and Privacy (footer links, not header nav).
 *
 * Run: node --env-file=.env --import tsx scripts/seed-footer-pages.ts
 */
import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  CTA_SECTION_NODE_TYPE,
  DEFAULT_CTA_SECTION,
  DEFAULT_FAQ_SECTION,
  DEFAULT_PRIVACY_DOCUMENT_SECTION,
  DEFAULT_TERMS_DOCUMENT_SECTION,
  EMPTY_CONTENT_DOCUMENT,
  FAQ_SECTION_NODE_TYPE,
  LEGAL_DOCUMENT_SECTION_NODE_TYPE,
  type ContentDocument,
  type ContentNode,
} from "~/lib/content";
import * as schema from "~/server/db/schema";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

function block(type: string, data: unknown): ContentNode {
  return { type, version: 1, data };
}

function document(children: ContentNode[]): ContentDocument {
  return {
    root: {
      ...EMPTY_CONTENT_DOCUMENT.root,
      children,
    },
  };
}

const PAGES: {
  slug: string;
  title: string;
  excerpt: string;
  body: ContentDocument;
}[] = [
  {
    slug: "faq",
    title: "FAQ",
    excerpt:
      "Answers about pricing, timelines, ownership, technologies, support and how to start a project.",
    body: document([
      block(FAQ_SECTION_NODE_TYPE, DEFAULT_FAQ_SECTION),
      block(CTA_SECTION_NODE_TYPE, {
        ...DEFAULT_CTA_SECTION,
        headline: "Still have a question?",
        description:
          "Send it with your project details and we will answer both in one reply.",
      }),
    ]),
  },
  {
    slug: "terms",
    title: "Terms of Service",
    excerpt: "Terms covering the use of this website and starting a project.",
    body: document([
      block(LEGAL_DOCUMENT_SECTION_NODE_TYPE, DEFAULT_TERMS_DOCUMENT_SECTION),
    ]),
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    excerpt: "How we collect, use and protect information you share with us.",
    body: document([
      block(LEGAL_DOCUMENT_SECTION_NODE_TYPE, DEFAULT_PRIVACY_DOCUMENT_SECTION),
    ]),
  },
];

async function main() {
  for (const page of PAGES) {
    const existing = await db
      .select()
      .from(schema.contentEntries)
      .where(
        and(
          eq(schema.contentEntries.kind, "page"),
          eq(schema.contentEntries.slug, page.slug),
        ),
      )
      .limit(1);

    const row = existing[0];
    const now = new Date();

    if (row) {
      await db
        .update(schema.contentEntries)
        .set({
          title: page.title,
          excerpt: page.excerpt,
          body: page.body,
          status: "published",
          showInNav: false,
          publishedAt: row.publishedAt ?? now,
          updatedAt: now,
        })
        .where(eq(schema.contentEntries.id, row.id));
      console.log(`Updated page /${page.slug} (${row.id})`);
    } else {
      const [inserted] = await db
        .insert(schema.contentEntries)
        .values({
          kind: "page",
          slug: page.slug,
          title: page.title,
          excerpt: page.excerpt,
          body: page.body,
          status: "published",
          showInNav: false,
          isHomepage: false,
          publishedAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.contentEntries.id });
      console.log(`Created page /${page.slug} (${inserted?.id})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
