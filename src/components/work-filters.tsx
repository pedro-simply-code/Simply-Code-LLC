"use client";

import { useMemo, useState } from "react";
import { WorkCard } from "~/components/work-card";
import type { Project } from "~/content/projects";
import { cn } from "~/lib/utils";

const filterButton =
  "site-control site-radius-md px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-[box-shadow,background-color,color]";

function tagMatches(projectTag: string, selected: string) {
  return projectTag.toLowerCase() === selected.toLowerCase();
}

export function WorkFilters({ projects }: { projects: Project[] }) {
  const tagFilters = useMemo(() => {
    const tags = projects.flatMap((project) => project.tags);
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
  }, [projects]);
  /** Single-select filter: `null` means "all projects". */
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeTag === null) return projects;
    return projects.filter((project) =>
      project.tags.some((tag) => tagMatches(tag, activeTag)),
    );
  }, [activeTag, projects]);

  function toggleTag(tag: string) {
    setActiveTag((current) =>
      current !== null && tagMatches(current, tag) ? null : tag,
    );
  }

  function clearTags() {
    setActiveTag(null);
  }

  if (projects.length === 0) {
    return (
      <p className="py-16 text-center text-[15px] text-[#57524a]">
        No projects published yet.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-12 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-[11px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
          Filter
        </span>
        <button
          type="button"
          onClick={clearTags}
          aria-pressed={activeTag === null}
          className={cn(
            filterButton,
            activeTag === null
              ? "bg-sc-accent hover:bg-sc-accent text-white shadow-[0_2px_10px_rgba(21,19,15,0.18)]"
              : "text-sc-ink bg-transparent hover:bg-white",
          )}
        >
          All
        </button>
        {tagFilters.map((filter) => {
          const selected = activeTag !== null && tagMatches(activeTag, filter);
          return (
            <button
              key={filter}
              type="button"
              onClick={() => toggleTag(filter)}
              aria-pressed={selected}
              className={cn(
                filterButton,
                selected
                  ? "bg-sc-accent hover:bg-sc-accent text-white shadow-[0_2px_10px_rgba(21,19,15,0.18)]"
                  : "text-sc-ink bg-transparent hover:bg-white",
              )}
            >
              {filter}
            </button>
          );
        })}
        <span className="ml-auto text-right text-[12px] text-[#6f6a60]">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div
        className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
        aria-live="polite"
      >
        {filtered.map((project) => (
          <WorkCard
            key={project.slug}
            project={project}
            activeFilterTags={activeTag === null ? [] : [activeTag]}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#57524a]">
          No projects match the selected stack.
        </p>
      ) : null}
    </div>
  );
}
