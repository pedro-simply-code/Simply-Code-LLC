"use client";

import { useMemo, useState } from "react";
import { WorkCard } from "~/components/work-card";
import type { Project } from "~/content/projects";
import { cn } from "~/lib/utils";

export function WorkFilters({ projects }: { projects: Project[] }) {
  const filters = useMemo(() => {
    const tags = projects.flatMap((project) => project.tags);
    return ["All", ...Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b))];
  }, [projects]);
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((project) =>
            project.tags.some((tag) => tag.toLowerCase() === active.toLowerCase()),
          ),
    [active, projects],
  );

  if (projects.length === 0) {
    return (
      <p className="py-16 text-center text-[15px] text-[#57524a]">No projects published yet.</p>
    );
  }

  return (
    <div>
      <div className="mb-12 flex flex-wrap items-center gap-2 border-b border-[#15130f]/10 pb-6">
        <span className="mr-2 text-[11px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
          Filter
        </span>
        {filters.map((filter) => (
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
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {filtered.map((project) => (
          <WorkCard key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#57524a]">
          No projects with this stack tag yet.
        </p>
      ) : null}
    </div>
  );
}
