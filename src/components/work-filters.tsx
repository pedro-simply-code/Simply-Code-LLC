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
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return projects;
    return projects.filter((project) =>
      activeTags.some((selected) =>
        project.tags.some((tag) => tagMatches(tag, selected)),
      ),
    );
  }, [activeTags, projects]);

  function toggleTag(tag: string) {
    setActiveTags((current) => {
      const has = current.some((t) => tagMatches(t, tag));
      if (has) return current.filter((t) => !tagMatches(t, tag));
      return [...current, tag];
    });
  }

  function clearTags() {
    setActiveTags([]);
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
          aria-pressed={activeTags.length === 0}
          className={cn(
            filterButton,
            activeTags.length === 0
              ? "bg-sc-accent hover:bg-sc-accent text-white shadow-[0_2px_10px_rgba(21,19,15,0.18)]"
              : "text-sc-ink bg-transparent hover:bg-white",
          )}
        >
          All
        </button>
        {tagFilters.map((filter) => {
          const selected = activeTags.some((t) => tagMatches(t, filter));
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
          {activeTags.length > 0 ? (
            <span className="mt-0.5 block text-[11px] text-[#9a9488]">
              Matches any selected tag
            </span>
          ) : null}
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
            activeFilterTags={activeTags}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#57524a]">
          No projects match the selected stack tags.
        </p>
      ) : null}
    </div>
  );
}
