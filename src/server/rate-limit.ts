import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { rateLimits } from "~/server/db/schema";

/**
 * Fixed-window rate limit backed by Postgres (works on serverless).
 * Returns true when the request is allowed.
 */
export async function consumeRateLimit(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const key = bucket.slice(0, 200);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const [existing] = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.bucket, key))
    .limit(1);

  if (!existing) {
    await db.insert(rateLimits).values({
      bucket: key,
      count: 1,
      resetAt,
    });
    return true;
  }

  if (existing.resetAt.getTime() <= now.getTime()) {
    await db
      .update(rateLimits)
      .set({ count: 1, resetAt })
      .where(eq(rateLimits.bucket, key));
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  await db
    .update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.bucket, key));

  return true;
}
