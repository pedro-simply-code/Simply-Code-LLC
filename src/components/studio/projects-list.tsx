import Link from "next/link";
import { ArrowRight, ExternalLink, Pencil } from "lucide-react";
import type { StudioViewMode } from "~/lib/studio-view";
import { appPanel, appPanelHover } from "~/lib/surface";
import {
  studioProjectGhostButton,
  studioProjectPanel,
} from "~/lib/studio-project-surface";
import { cn } from "~/lib/utils";

export type StudioProjectRow = {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  stackLabel: string;
  status: string;
  updatedAt: Date;
  leadName: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const published = status === "published" || status === "completed";
  return (
    <span
      className={
        published
          ? "rounded-md bg-[#e8f5e9] px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase"
          : "rounded-md bg-sc-section-alt px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase shadow-[0_1px_2px_rgba(21,19,15,0.05)]"
      }
    >
      {status}
    </span>
  );
}

function ProjectActions({ project }: { project: StudioProjectRow }) {
  const isPublic = project.status === "published" || project.status === "completed";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPublic ? (
        <Link
          href={`/work/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
        >
          <ExternalLink className="size-3" />
          Public
        </Link>
      ) : null}
      <Link
        href={`/studio/projects/${project.id}?tab=edit`}
        className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
      >
        <Pencil className="size-3" />
        Edit
      </Link>
      <Link
        href={`/studio/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-sc-accent"
      >
        Open
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function ProjectGridCard({ project }: { project: StudioProjectRow }) {
  return (
    <article className={cn(appPanel, appPanelHover, "flex flex-col p-4")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/studio/projects/${project.id}`}
            className="font-semibold hover:text-sc-accent"
          >
            {project.title}
          </Link>
          <p className="mt-0.5 truncate text-[11px] text-[#9a9488]">/work/{project.slug}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-[11px]">
        <div>
          <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">Stack</dt>
          <dd className="mt-0.5 text-[#57524a]">{project.stackLabel || "—"}</dd>
        </div>
        <div>
          <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">Lead</dt>
          <dd className="mt-0.5 text-[#57524a]">
            {project.leadName ?? <span className="text-sc-accent">Unassigned</span>}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] text-[#9a9488]">
        Updated {new Date(project.updatedAt).toLocaleDateString()}
      </p>
      <div className="mt-4 border-t border-[#15130f]/8 pt-3">
        <ProjectActions project={project} />
      </div>
    </article>
  );
}

export function StudioProjectsList({
  projects,
  view = "list",
}: {
  projects: StudioProjectRow[];
  view?: StudioViewMode;
}) {
  if (projects.length === 0) {
    return null;
  }

  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectGridCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`hidden overflow-x-auto md:block ${studioProjectPanel}`}>
        <table className="w-full min-w-[840px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[23%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead className="bg-sc-canvas/95">
            <tr className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Stack</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15130f]/10">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-sc-section-alt/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/studio/projects/${project.id}`}
                    className="font-semibold hover:text-sc-accent"
                  >
                    {project.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-[#9a9488]">/work/{project.slug}</p>
                </td>
                <td className="px-4 py-3 text-[#57524a]">
                  <span
                    className="line-clamp-2 text-[12px] leading-snug"
                    title={project.stackLabel || undefined}
                  >
                    {project.stackLabel || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#57524a]">
                  <span className="block truncate" title={project.leadName ?? undefined}>
                    {project.leadName ?? <span className="text-sc-accent">Unassigned</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-[11px] whitespace-nowrap text-[#9a9488]">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-end gap-1.5">
                    <ProjectActions project={project} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={`divide-y divide-[#15130f]/8 md:hidden ${studioProjectPanel}`}>
        {projects.map((project) => (
          <li key={project.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/studio/projects/${project.id}`}
                  className="font-semibold hover:text-sc-accent"
                >
                  {project.title}
                </Link>
                <p className="mt-0.5 text-[11px] text-[#9a9488]">/work/{project.slug}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">Stack</dt>
                <dd className="mt-0.5 text-[#57524a]">{project.stackLabel || "—"}</dd>
              </div>
              <div>
                <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">Lead</dt>
                <dd className="mt-0.5 text-[#57524a]">
                  {project.leadName ?? "Unassigned"}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[10px] text-[#9a9488]">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </p>
            <div className="mt-3">
              <ProjectActions project={project} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
