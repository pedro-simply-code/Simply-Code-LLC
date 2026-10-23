/** Common timezones for a US + Guatemala studio. */
export const PROFILE_TIMEZONES: { value: string; label: string }[] = [
  { value: "", label: "Not set" },
  { value: "America/Guatemala", label: "Guatemala (Central)" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Denver", label: "US Mountain" },
  { value: "America/Phoenix", label: "US Arizona" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "UTC", label: "UTC" },
];

export function normalizeOptionalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const href = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}
