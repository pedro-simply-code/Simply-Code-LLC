import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "~/content/projects";

type WorkCardProps = {
  project: Project;
  showSummary?: boolean;
};

export function WorkCard({ project, showSummary = true }: WorkCardProps) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/work/${project.slug}`}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8770a]"
      >
        <div className="relative aspect-[1000/560] overflow-hidden bg-gradient-to-br from-[#f0a500] to-[#e2761b]">
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
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#f0a500] uppercase">Stack</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-white/25 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-[#15130f]/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            View case <ArrowUpRight className="size-3" />
          </span>
        </div>

        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-[#b8770a]">
              {project.title}
            </h3>
            <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
              {project.client}
            </span>
          </div>

          {showSummary ? (
            <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">{project.summary}</p>
          ) : null}

          <ul className="mt-4 flex flex-wrap gap-2 pointer-fine:hidden">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="border border-[#15130f]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#57524a] uppercase"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  );
}
