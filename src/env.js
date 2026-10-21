import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DB_TABLE_PREFIX: z
      .string()
      .min(1)
      .regex(/^[a-z][a-z0-9_]*$/i, "Use letters, numbers, underscores; start with a letter"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AUTH_SECRET: z.string().min(1),
    AUTH_URL: z.string().url().optional(),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    UPLOADTHING_TOKEN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().default("Simply Code"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_TABLE_PREFIX: process.env.DB_TABLE_PREFIX,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
