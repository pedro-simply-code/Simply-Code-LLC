import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "~/content/projects";
import { appTag } from "~/lib/surface";
import { cn } from "~/lib/utils";

function tagMatches(projectTag: string, filterTag: string) {
  return projectTag.toLowerCase() === filterTag.toLowerCase();
}

function tagIsActiveFilter(tag: string, activeFilterTags: string[]) {
  return activeFilterTags.some((filter) => tagMatches(tag, filter));
}

type WorkCardProps = {
  project: Project;
  showSummary?: boolean;
  /** When set, matching tags are highlighted (portfolio filters). */
  activeFilterTags?: string[];
};

export function WorkCard({ project, showSummary = true, activeFilterTags = [] }: WorkCardProps) {
  const hasActiveFilters = activeFilterTags.length > 0;
  return (
    <article className="site-reveal group flex flex-col">
      <Link
        href={`/work/${project.slug}`}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sc-accent"
      >
        <div className="relative aspect-[1000/560] overflow-hidden rounded-lg bg-gradient-to-br from-sc-accent-bright to-sc-accent shadow-[0_2px_12px_rgba(21,19,15,0.08)]">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} website preview`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-15">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
                <div key={cell} className="bg-white/40" />
              ))}
            </div>
          )}

          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#15130f] via-[#15130f]/85 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:hidden">
            <p className="text-[10px] font-bold tracking-[0.22em] text-sc-accent-bright uppercase">Stack</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => {
                const matched = hasActiveFilters && tagIsActiveFilter(tag, activeFilterTags);
                return (
                  <li
                    key={tag}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase shadow-[0_1px_2px_rgba(0,0,0,0.15)] backdrop-blur-sm",
                      matched
                        ? "bg-sc-accent-bright text-[#15130f]"
                        : "bg-white/15 text-white",
                    )}
                  >
                    {tag}
                  </li>
                );
              })}
            </ul>
          </div>

          <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-[#15130f]/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            View case <ArrowUpRight className="size-3" />
          </span>
        </div>

        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-sc-accent">
              {project.title}
            </h3>
            <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
              {project.client}
            </span>
          </div>

          {showSummary ? (
            <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">{project.summary}</p>
          ) : null}

          <ul
            className={cn(
              "mt-4 flex flex-wrap gap-2",
              hasActiveFilters ? "flex" : "pointer-fine:hidden",
            )}
          >
            {project.tags.map((tag) => {
              const matched = hasActiveFilters && tagIsActiveFilter(tag, activeFilterTags);
              return (
                <li
                  key={tag}
                  className={cn(
                    appTag,
                    matched && "bg-sc-accent-bright text-[#15130f] ring-1 ring-sc-accent/40",
                  )}
                >
                  {tag}
                </li>
              );
            })}
          </ul>
        </div>
      </Link>
    </article>
  );
}
