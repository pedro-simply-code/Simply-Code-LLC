import type { SiteSettings } from "~/lib/site-settings";

/** Apply theme tokens to `<html>` for live preview (client only). */
export function applySiteSettingsToDocument(settings: SiteSettings) {
  const root = document.documentElement;
  root.dataset.siteSurface = settings.surfaceStyle;
  root.dataset.siteRadius = settings.cornerRadius;
  root.dataset.sitePalette = settings.colorPalette;
  root.dataset.siteMotion = settings.motionLevel;
}
