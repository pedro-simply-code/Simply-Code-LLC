export const SITE_COLOR_PALETTES = [
  "orange",
  "blue",
  "violet",
  "green",
  "teal",
  "rose",
  "indigo",
  "navy",
] as const;
export type SiteColorPalette = (typeof SITE_COLOR_PALETTES)[number];

export const SITE_PALETTE_LABELS: Record<SiteColorPalette, string> = {
  orange: "Orange",
  blue: "Blue",
  violet: "Violet",
  green: "Green",
  teal: "Teal",
  rose: "Rose",
  indigo: "Indigo",
  navy: "Navy",
};

/** Optional hint for seasonal or campaign use (shown in site settings). */
export const SITE_PALETTE_NOTES: Partial<Record<SiteColorPalette, string>> = {
  orange: "Brand default · summer warmth",
  blue: "Winter",
  rose: "Holidays & campaigns",
  green: "Spring / growth",
};

export const SITE_PALETTE_SWATCH: Record<
  SiteColorPalette,
  { accent: string; bright: string; canvas: string; section: string }
> = {
  orange: { accent: "#b8770a", bright: "#f0a500", canvas: "#f7f4ee", section: "#ffffff" },
  blue: { accent: "#1d6b99", bright: "#4a9fd9", canvas: "#eff4f8", section: "#ffffff" },
  violet: { accent: "#6b3fa8", bright: "#9b6fd4", canvas: "#f3f0f8", section: "#ffffff" },
  green: { accent: "#1f7a4d", bright: "#3dbf7a", canvas: "#edf5f0", section: "#ffffff" },
  teal: { accent: "#0f6b6e", bright: "#2eb8b8", canvas: "#edf5f5", section: "#ffffff" },
  rose: { accent: "#a63d52", bright: "#e07088", canvas: "#faf0f2", section: "#ffffff" },
  indigo: { accent: "#434f9e", bright: "#6d7ed4", canvas: "#eef0f8", section: "#ffffff" },
  navy: { accent: "#1e3a5f", bright: "#4a7ab8", canvas: "#eef2f7", section: "#ffffff" },
};

/** Palettes removed from the UI; map stored values to a supported palette. */
export function normalizeColorPalette(value: unknown): SiteColorPalette {
  if (
    typeof value === "string" &&
    (SITE_COLOR_PALETTES as readonly string[]).includes(value)
  ) {
    return value as SiteColorPalette;
  }
  if (value === "white" || value === "black" || value === "red") return "orange";
  return "orange";
}
