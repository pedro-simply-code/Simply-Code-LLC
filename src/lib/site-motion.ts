export const SITE_MOTION_LEVELS = ["none", "subtle", "balanced", "bold"] as const;
export type SiteMotionLevel = (typeof SITE_MOTION_LEVELS)[number];

export const SITE_MOTION_LABELS: Record<SiteMotionLevel, string> = {
  none: "Off",
  subtle: "Subtle",
  balanced: "Balanced",
  bold: "Bold",
};

export const SITE_MOTION_DESCRIPTIONS: Record<SiteMotionLevel, string> = {
  none: "No entrance motion — static layout, fastest paint.",
  subtle: "Soft fades on scroll — minimal movement, calm feel.",
  balanced: "Fade and slide on sections — default agency polish.",
  bold: "Stronger motion and stagger — high-energy landing pages.",
};

export function normalizeMotionLevel(value: unknown): SiteMotionLevel {
  if (
    typeof value === "string" &&
    (SITE_MOTION_LEVELS as readonly string[]).includes(value)
  ) {
    return value as SiteMotionLevel;
  }
  return "balanced";
}
