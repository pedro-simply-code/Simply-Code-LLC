/**
 * Applies recent schema additions without interactive drizzle-kit prompts.
 * Safe to re-run (IF NOT EXISTS). Uses DB_TABLE_PREFIX from .env.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
const prefix = process.env.DB_TABLE_PREFIX ?? "simplycode";

if (!url) {
  console.error("DATABASE_URL is required (use: node --env-file=.env …)");
  process.exit(1);
}

const sql = neon(url);

async function run(statement: string) {
  await sql.query(statement, []);
}

async function main() {
  const users = `${prefix}_users`;
  const projects = `${prefix}_projects`;

  await run(`ALTER TABLE "${users}" ADD COLUMN IF NOT EXISTS totp_secret text`);
  await run(
    `ALTER TABLE "${users}" ADD COLUMN IF NOT EXISTS totp_enabled boolean NOT NULL DEFAULT false`,
  );

  await run(`
    CREATE TABLE IF NOT EXISTS "${prefix}_rate_limits" (
      bucket varchar(200) PRIMARY KEY,
      count integer NOT NULL DEFAULT 0,
      reset_at timestamptz NOT NULL
    )
  `);

  await run(`
    DO $$ BEGIN
      CREATE TYPE "${prefix}_upload_claim_kind" AS ENUM ('avatar', 'message_attachment');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await run(`
    DO $$ BEGIN
      ALTER TYPE "${prefix}_upload_claim_kind" ADD VALUE IF NOT EXISTS 'project_deliverable';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS "${prefix}_user_upload_claims" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES "${users}"(id) ON DELETE CASCADE,
      url text NOT NULL,
      kind "${prefix}_upload_claim_kind" NOT NULL,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS "${prefix}_user_upload_claims_url_unique"
    ON "${prefix}_user_upload_claims" (url)
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS "${prefix}_audit_events" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id uuid REFERENCES "${users}"(id) ON DELETE SET NULL,
      action varchar(120) NOT NULL,
      entity_type varchar(80),
      entity_id uuid,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      ip_address varchar(128),
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS "${prefix}_project_milestones" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL REFERENCES "${projects}"(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      sort_order integer NOT NULL DEFAULT 0,
      target_date timestamptz,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS "${prefix}_project_deliverables" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL REFERENCES "${projects}"(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text NOT NULL DEFAULT '',
      file_url text NOT NULL,
      file_name text NOT NULL,
      file_size integer NOT NULL,
      content_type text NOT NULL,
      visibility text NOT NULL DEFAULT 'client',
      uploaded_by_id uuid REFERENCES "${users}"(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log(`Schema sync complete for prefix "${prefix}".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
