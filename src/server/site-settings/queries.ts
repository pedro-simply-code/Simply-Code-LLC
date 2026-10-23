import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  type SiteSettings,
} from "~/lib/site-settings";
import { db } from "~/server/db";
import { siteSettings as siteSettingsTable } from "~/server/db/schema";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

const GLOBAL_KEY = "global";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettingsTable.key, GLOBAL_KEY),
  });
  if (!row) return DEFAULT_SITE_SETTINGS;
  return mergeSiteSettings(row.settings);
});
