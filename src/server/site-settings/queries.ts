import "server-only";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
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
const REVALIDATE_SECONDS = 300;

const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const row = await db.query.siteSettings.findFirst({
        where: eq(siteSettingsTable.key, GLOBAL_KEY),
      });
      if (!row) return DEFAULT_SITE_SETTINGS;
      return mergeSiteSettings(row.settings);
    } catch (error) {
      // Never let a transient DB failure take down the whole layout.
      console.error("[site-settings] falling back to defaults", error);
      return DEFAULT_SITE_SETTINGS;
    }
  },
  ["site-settings"],
  { revalidate: REVALIDATE_SECONDS, tags: [SITE_SETTINGS_CACHE_TAG] },
);

/** Per-request memoised, cross-request cached site settings. */
export const getSiteSettings = cache(getCachedSiteSettings);
