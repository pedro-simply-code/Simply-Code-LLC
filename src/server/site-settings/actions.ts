"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { normalizeColorPalette } from "~/lib/site-palette";
import { siteSettingsSchema } from "~/lib/site-settings";
import { db } from "~/server/db";
import { siteSettings as siteSettingsTable } from "~/server/db/schema";
import { SITE_SETTINGS_CACHE_TAG } from "~/server/site-settings/queries";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  if (!isFounder(session?.user.role)) {
    redirect("/studio");
  }

  const parsed = siteSettingsSchema.safeParse({
    surfaceStyle: text(formData, "surfaceStyle"),
    cornerRadius: text(formData, "cornerRadius"),
    colorPalette: normalizeColorPalette(text(formData, "colorPalette")),
    maintenanceMode: formData.get("maintenanceMode") === "on",
    maintenanceMessage: text(formData, "maintenanceMessage"),
  });

  if (!parsed.success) {
    redirect("/studio/settings?error=validation");
  }

  const values = parsed.data;

  await db
    .insert(siteSettingsTable)
    .values({
      key: "global",
      settings: values,
      updatedById: session!.user.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettingsTable.key,
      set: {
        settings: values,
        updatedById: session!.user.id,
        updatedAt: new Date(),
      },
    });

  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  redirect("/studio/settings?saved=1");
}
