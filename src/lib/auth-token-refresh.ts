import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { JWT } from "next-auth/jwt";
import { env } from "~/env";
import { isFounder, normalizeRole } from "~/lib/roles";
import { users } from "~/server/db/schema";

const sql = neon(env.DATABASE_URL);
const edgeDb = drizzle(sql);

/** Keeps JWT session claims in sync with the database (middleware + Auth.js). */
export async function refreshAuthTokenFromDb(token: JWT): Promise<JWT> {
  if (!token.sub) return token;

  const [row] = await edgeDb
    .select({
      name: users.name,
      image: users.image,
      role: users.role,
      totpEnabled: users.totpEnabled,
    })
    .from(users)
    .where(eq(users.id, token.sub))
    .limit(1);

  if (!row) return token;

  token.name = row.name;
  token.picture = row.image;
  token.role = normalizeRole(row.role);
  token.totpRequired = isFounder(row.role) && row.totpEnabled;
  return token;
}
