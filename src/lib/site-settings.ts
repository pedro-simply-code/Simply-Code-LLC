import { z } from "zod";
import { normalizeColorPalette, SITE_COLOR_PALETTES } from "~/lib/site-palette";

export const SITE_CORNER_RADIUS = ["none", "sm", "md", "lg"] as const;
export type SiteCornerRadius = (typeof SITE_CORNER_RADIUS)[number];

export const SITE_CORNER_RADIUS_LABELS: Record<SiteCornerRadius, string> = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

export const SITE_CORNER_RADIUS_DESCRIPTIONS: Record<SiteCornerRadius, string> = {
  none: "0px — sharp corners on cards and controls.",
  sm: "~4px cards · ~2px buttons and inputs.",
  md: "~8px cards · ~6px buttons and inputs.",
  lg: "~12px cards · ~8px buttons and inputs.",
};

export function normalizeCornerRadius(
  value: unknown,
  legacyRoundedCorners?: unknown,
): SiteCornerRadius {
  if (
    typeof value === "string" &&
    (SITE_CORNER_RADIUS as readonly string[]).includes(value)
  ) {
    return value as SiteCornerRadius;
  }
  if (legacyRoundedCorners === false) return "none";
  if (legacyRoundedCorners === true) return "md";
  return "md";
}

export const SITE_SURFACE_STYLES = ["shadow", "border", "both", "flat"] as const;
export type SiteSurfaceStyle = (typeof SITE_SURFACE_STYLES)[number];

export const SITE_SURFACE_STYLE_LABELS: Record<SiteSurfaceStyle, string> = {
  shadow: "Soft shadow",
  border: "Border only",
  both: "Shadow + border",
  flat: "Flat",
};

export const SITE_SURFACE_STYLE_DESCRIPTIONS: Record<SiteSurfaceStyle, string> = {
  shadow: "Elevated panels and inset fields.",
  border: "Flat panels and bordered fields.",
  both: "Subtle depth with a clear edge.",
  flat: "No shadow or border — color blocks only.",
};

export const siteSettingsSchema = z.object({
  /** Raised panels, cards, and form fields. */
  surfaceStyle: z.enum(SITE_SURFACE_STYLES),
  cornerRadius: z.enum(SITE_CORNER_RADIUS),
  colorPalette: z.enum(SITE_COLOR_PALETTES),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().max(500),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  surfaceStyle: "shadow",
  cornerRadius: "md",
  colorPalette: "orange",
  maintenanceMode: false,
  maintenanceMessage: "We are making improvements. Please check back soon.",
};

function withNormalizedSiteSettingsInput(partial: unknown): unknown {
  if (!partial || typeof partial !== "object") return partial;
  const raw = { ...(partial as Record<string, unknown>) };
  if ("colorPalette" in raw) {
    raw.colorPalette = normalizeColorPalette(raw.colorPalette);
  }
  const legacy = raw.roundedCorners;
  raw.cornerRadius = normalizeCornerRadius(raw.cornerRadius, legacy);
  delete raw.roundedCorners;
  return raw;
}

export function mergeSiteSettings(partial: unknown): SiteSettings {
  const normalized = withNormalizedSiteSettingsInput(partial);
  const parsed = siteSettingsSchema.safeParse(normalized);
  if (parsed.success) return parsed.data;

  if (!normalized || typeof normalized !== "object") return DEFAULT_SITE_SETTINGS;

  const loose = siteSettingsSchema.partial().safeParse(normalized);
  if (loose.success) {
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...loose.data,
      colorPalette: normalizeColorPalette(loose.data.colorPalette),
      cornerRadius: normalizeCornerRadius(loose.data.cornerRadius),
    };
  }
  return DEFAULT_SITE_SETTINGS;
}

export type SiteSettingsHtmlProps = {
  "data-site-surface": SiteSettings["surfaceStyle"];
  "data-site-radius": SiteCornerRadius;
  "data-site-palette": SiteSettings["colorPalette"];
};

export function siteSettingsHtmlProps(settings: SiteSettings): SiteSettingsHtmlProps {
  return {
    "data-site-surface": settings.surfaceStyle,
    "data-site-radius": settings.cornerRadius,
    "data-site-palette": settings.colorPalette,
  };
}
