"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  type StudioOverviewViewScope,
  type StudioViewMode,
  studioOverviewViewParam,
} from "~/lib/studio-view";
import { appIconButton } from "~/lib/surface";
import { cn } from "~/lib/utils";

const viewToggleActiveClass =
  "bg-sc-accent text-white shadow-[0_1px_2px_rgba(21,19,15,0.12)] hover:bg-sc-accent";

function StudioViewToggleInner({ scope }: { scope?: StudioOverviewViewScope }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramKey = scope ? studioOverviewViewParam[scope] : "view";
  const view: StudioViewMode =
    searchParams.get(paramKey) === "list" ? "list" : "grid";

  const setView = (next: StudioViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.set(paramKey, "list");
    else params.delete(paramKey);
    if (!scope) {
      params.delete("page");
      params.delete("pv");
      params.delete("av");
      params.delete("xv");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div
      className="bg-sc-section-alt inline-flex gap-0.5 rounded-md p-0.5 shadow-[inset_0_1px_2px_rgba(21,19,15,0.06)]"
      role="group"
      aria-label="Layout"
    >
      <button
        type="button"
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        title="List view"
        className={cn(
          appIconButton,
          "size-8 rounded-sm border-0 shadow-none",
          view === "list" ? viewToggleActiveClass : "hover:text-sc-accent",
        )}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        title="Grid view"
        className={cn(
          appIconButton,
          "size-8 rounded-sm border-0 shadow-none",
          view === "grid" ? viewToggleActiveClass : "hover:text-sc-accent",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}

export function StudioViewToggle({
  scope,
}: {
  scope?: StudioOverviewViewScope;
}) {
  return (
    <Suspense fallback={<span className="inline-block size-8" aria-hidden />}>
      <StudioViewToggleInner scope={scope} />
    </Suspense>
  );
}

export function StudioViewToolbar({
  summary,
  pageSummary,
}: {
  summary: ReactNode;
  pageSummary?: string | null;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-[#6f6a60]">
        {summary}
        {pageSummary ? (
          <span className="mt-0.5 block text-[11px] text-[#9a9488]">
            {pageSummary}
          </span>
        ) : null}
      </div>
      <StudioViewToggle />
    </div>
  );
}
