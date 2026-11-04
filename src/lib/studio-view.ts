export type StudioViewMode = "list" | "grid";

/** Grid is the default; pass `view=list` for table / row layout. */
export function parseStudioView(
  value: string | null | undefined,
): StudioViewMode {
  return value === "list" ? "list" : "grid";
}

/** Saved list/grid per studio list page (independent cookies). */
export type StudioViewPersistScope = "content" | "projects";

const STUDIO_VIEW_COOKIE_PREFIX = "simplycode_studio_view_";

export function studioViewCookieName(scope: StudioViewPersistScope): string {
  return `${STUDIO_VIEW_COOKIE_PREFIX}${scope}`;
}

/** URL `view` wins; otherwise read the scoped layout cookie. */
export function resolveStudioView(
  scope: StudioViewPersistScope,
  viewParam: string | null | undefined,
  cookieValue: string | null | undefined,
): StudioViewMode {
  if (viewParam === "list" || viewParam === "grid") return viewParam;
  return parseStudioView(cookieValue);
}

const STUDIO_VIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

/** Client-only: read persisted layout for a studio list page. */
export function readStudioViewCookie(
  scope: StudioViewPersistScope,
): StudioViewMode | null {
  if (typeof document === "undefined") return null;
  const name = studioViewCookieName(scope);
  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key === name && (value === "list" || value === "grid")) {
      return value;
    }
  }
  return null;
}

/** Client-only: persist layout for a studio list page. */
export function writeStudioViewCookie(
  scope: StudioViewPersistScope,
  mode: StudioViewMode,
): void {
  if (typeof document === "undefined") return;
  const name = studioViewCookieName(scope);
  document.cookie = `${name}=${mode}; path=/; max-age=${STUDIO_VIEW_COOKIE_MAX_AGE}; samesite=lax`;
}

/** Independent list/grid on studio overview columns (`?pv=`, `?av=`, `?xv=`). */
export type StudioOverviewViewScope = "projects" | "attention" | "activity";

export const studioOverviewViewParam: Record<StudioOverviewViewScope, string> =
  {
    projects: "pv",
    attention: "av",
    activity: "xv",
  };
