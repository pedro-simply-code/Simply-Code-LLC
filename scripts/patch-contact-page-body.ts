/**
 * Rebuilds the published CMS page `contact` body to match the static contact layout.
 *
 * Run: node --env-file=.env --import tsx scripts/patch-contact-page-body.ts
 */
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  CONTACT_SECTION_NODE_TYPE,
  DEFAULT_CONTACT_PAGE_SECTION,
  EMPTY_CONTENT_DOCUMENT,
  type ContentDocument,
  type ContentNode,
} from "~/lib/content";
import * as schema from "~/server/db/schema";

const url = process.env.DATABASE_URL;
const prefix = process.env.DB_TABLE_PREFIX ?? "simplycode";

if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle(sql, { schema });

const CONTACT_EXCERPT =
  "Tell us about your project. We reply within one business day with next steps, a scope and a fixed quote.";

function contactPageDocument(): ContentDocument {
  const contactBlock: ContentNode = {
    type: CONTACT_SECTION_NODE_TYPE,
    version: 1,
    data: DEFAULT_CONTACT_PAGE_SECTION,
  };

  return {
    root: {
      ...EMPTY_CONTENT_DOCUMENT.root,
      children: [contactBlock],
    },
  };
}

async function main() {
  const entries = await db
    .select()
    .from(schema.contentEntries)
    .where(
      and(
        eq(schema.contentEntries.kind, "page"),
        eq(schema.contentEntries.slug, "contact"),
      ),
    )
    .limit(1);

  const entry = entries[0];
  if (!entry) {
    console.log(
      `No page with slug "contact" in ${prefix}_content_entries. Create it in Studio first.`,
    );
    process.exit(0);
  }

  const body = contactPageDocument();

  await db
    .update(schema.contentEntries)
    .set({
      body,
      excerpt: entry.excerpt?.trim() ? entry.excerpt : CONTACT_EXCERPT,
      status: "published",
      publishedAt: entry.publishedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.contentEntries.id, entry.id));

  console.log(
    `Updated contact page (${entry.id}, status=${entry.status}) with Lexical contact block (page layout).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
