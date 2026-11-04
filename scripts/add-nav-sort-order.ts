/**
 * One-off: add nav_sort_order to content_entries.
 * Run: node --env-file=.env --import tsx scripts/add-nav-sort-order.ts
 */
import { neon } from "@neondatabase/serverless";
import { env } from "~/env";

const sql = neon(env.DATABASE_URL);
const table = `${env.DB_TABLE_PREFIX}_content_entries`;

await sql.query(
  `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS nav_sort_order integer NOT NULL DEFAULT 0`,
);

console.log(`Added nav_sort_order to ${table}`);
