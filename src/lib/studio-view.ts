export type StudioViewMode = "list" | "grid";

/** Grid is the default; pass `view=list` for table / row layout. */
export function parseStudioView(value: string | null | undefined): StudioViewMode {
  return value === "list" ? "list" : "grid";
}

/** Independent list/grid on studio overview columns (`?pv=`, `?av=`, `?xv=`). */
export type StudioOverviewViewScope = "projects" | "attention" | "activity";

export const studioOverviewViewParam: Record<StudioOverviewViewScope, string> = {
  projects: "pv",
  attention: "av",
  activity: "xv",
};
