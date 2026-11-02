import { neon } from "@neondatabase/serverless";
import { env } from "~/env";

const sql = neon(env.DATABASE_URL);
const prefix = env.DB_TABLE_PREFIX;

/**
 * Run from a scheduled job (e.g. cron) to cap table growth.
 *
 * Uses the Neon HTTP driver directly so the script works outside the Next.js
 * runtime (the `server-only` marker would otherwise throw).
 */
export async function runNotificationRetention(olderThanDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const rows = await sql.query(
    `DELETE FROM "${prefix}_notifications"
     WHERE created_at < $1
       AND (read_at IS NULL OR read_at < $1)
     RETURNING id`,
    [cutoff],
  );
  const removed = rows.length;

  console.info("[notifications] retention removed", { removed, olderThanDays });
  return removed;
}
