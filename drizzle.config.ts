import { neonConfig } from "@neondatabase/serverless";
import { defineConfig } from "drizzle-kit";
import ws from "ws";
import { env } from "~/env";

/** Required for `drizzle-kit migrate` / push introspection with Neon serverless in Node. */
neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: [`${env.DB_TABLE_PREFIX}_*`],
});
