"use client";

import { useMemo, useState } from "react";
import { WorkCard } from "~/components/work-card";
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from "~/content/projects";
import { cn } from "~/lib/utils";

type Filter = "All" | ProjectCategory;

const FILTERS: Filter[] = ["All", ...PROJECT_CATEGORIES];

export function WorkFilters() {
  const [active, setActive] = useState<Filter>("All");

  const projects = useMemo(
    () => (active === "All" ? PROJECTS : PROJECTS.filter((project) => project.category === active)),
    [active],
  );

  return (
    <div>
      <div className="mb-12 flex flex-wrap items-center gap-2 border-b border-[#15130f]/10 pb-6">
        <span className="mr-2 text-[11px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
          Filter
        </span>
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            aria-pressed={active === filter}
            className={cn(
              "border px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors",
              active === filter
                ? "border-[#15130f] bg-[#15130f] text-white"
                : "border-[#15130f]/15 bg-transparent text-[#15130f] hover:border-[#15130f] hover:bg-white",
            )}
          >
            {filter}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-[#6f6a60]">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {projects.map((project) => (
          <WorkCard key={project.slug} project={project} />
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#57524a]">
          No projects in this category yet.
        </p>
      ) : null}
    </div>
  );
}
