import { neon } from "@neondatabase/serverless";
import { env } from "~/env";

/**
 * Table-growth clean-up for cron jobs.
 *
 * Uses the Neon HTTP driver directly (instead of `~/server/db`) so the same
 * functions can run from `pnpm maintenance:cleanup` outside of the Next.js
 * runtime, where the `server-only` marker would throw.
 */
const sql = neon(env.DATABASE_URL);
const prefix = env.DB_TABLE_PREFIX;

export async function pruneExpiredRateLimits(
  now = new Date(),
): Promise<number> {
  const rows = await sql.query(
    `DELETE FROM "${prefix}_rate_limits" WHERE reset_at < $1 RETURNING bucket`,
    [now],
  );
  return rows.length;
}

const UPLOAD_CLAIM_TTL_MS = 48 * 60 * 60 * 1000;

export async function pruneExpiredUploadClaims(
  now = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - UPLOAD_CLAIM_TTL_MS);
  const rows = await sql.query(
    `DELETE FROM "${prefix}_user_upload_claims" WHERE created_at < $1 RETURNING id`,
    [cutoff],
  );
  return rows.length;
}
