import "server-only";

import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { rateLimits } from "~/server/db/schema";

/**
 * Fixed-window rate limit backed by Postgres (works on serverless).
 *
 * Performed as a single atomic upsert so concurrent requests cannot both read
 * the same counter and exceed the limit. Returns true when the request is
 * allowed.
 */
export async function consumeRateLimit(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const key = bucket.slice(0, 200);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ bucket: key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.bucket,
      set: {
        // Expired window -> start over; otherwise increment in place.
        count: sql`case when ${rateLimits.resetAt} <= ${now} then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} <= ${now} then ${resetAt} else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count });

  return (row?.count ?? 0) <= limit;
}
