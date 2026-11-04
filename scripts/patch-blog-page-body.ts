/**
 * Ensures the published CMS page `blog` has Page header + Blog blocks in `body`.
 * Safe to re-run (skips blocks that already exist).
 *
 * Run: node --env-file=.env --import tsx scripts/patch-blog-page-body.ts
 */
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  contentDocumentUsesBlockType,
  type ContentDocument,
  type ContentNode,
} from "~/lib/content";
import {
  BLOG_SECTION_NODE_TYPE,
  DEFAULT_BLOG_PAGE_HEADER_SECTION,
  DEFAULT_BLOG_SECTION,
  PAGE_HEADER_SECTION_NODE_TYPE,
} from "~/lib/site-page-sections";
import * as schema from "~/server/db/schema";

const url = process.env.DATABASE_URL;
const prefix = process.env.DB_TABLE_PREFIX ?? "simplycode";

if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle(sql, { schema });

function decoratorNode(
  type: string,
  data: unknown,
): ContentNode {
  return {
    type,
    version: 1,
    data,
  };
}

function patchBlogBody(body: ContentDocument): {
  document: ContentDocument;
  changed: boolean;
} {
  const children = [...(body.root.children ?? [])];
  let changed = false;

  const hasHeader = contentDocumentUsesBlockType(body, PAGE_HEADER_SECTION_NODE_TYPE);
  const hasBlog = contentDocumentUsesBlockType(body, BLOG_SECTION_NODE_TYPE);

  if (!hasHeader) {
    children.unshift(
      decoratorNode(
        PAGE_HEADER_SECTION_NODE_TYPE,
        DEFAULT_BLOG_PAGE_HEADER_SECTION,
      ),
    );
    changed = true;
  }

  if (!hasBlog) {
    children.push(
      decoratorNode(BLOG_SECTION_NODE_TYPE, DEFAULT_BLOG_SECTION),
    );
    changed = true;
  }

  if (!changed) {
    return { document: body, changed: false };
  }

  return {
    document: {
      root: {
        ...body.root,
        children,
      },
    },
    changed: true,
  };
}

async function main() {
  const entries = await db
    .select()
    .from(schema.contentEntries)
    .where(
      and(
        eq(schema.contentEntries.kind, "page"),
        eq(schema.contentEntries.slug, "blog"),
      ),
    )
    .limit(1);

  const entry = entries[0];
  if (!entry) {
    console.log(
      `No page with slug "blog" in ${prefix}_content_entries. Create it in Studio first.`,
    );
    process.exit(0);
  }

  const body = entry.body as ContentDocument;
  const { document, changed } = patchBlogBody(body);

  if (!changed) {
    console.log(
      `Blog page (${entry.id}) already has page header and blog blocks. No update.`,
    );
    process.exit(0);
  }

  await db
    .update(schema.contentEntries)
    .set({
      body: document,
      updatedAt: new Date(),
    })
    .where(eq(schema.contentEntries.id, entry.id));

  console.log(
    `Updated blog page body (${entry.id}, status=${entry.status}): added missing blocks.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
