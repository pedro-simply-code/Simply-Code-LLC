import Link from "next/link";
import { ArrowRight, ExternalLink, Pencil } from "lucide-react";

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
          ? "bg-[#e8f5e9] px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase"
          : "bg-[#f7f4ee] px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase"
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
          className="inline-flex items-center gap-1.5 border border-[#15130f]/20 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
        >
          <ExternalLink className="size-3" />
          Public
        </Link>
      ) : null}
      <Link
        href={`/studio/projects/${project.id}?tab=edit`}
        className="inline-flex items-center gap-1.5 border border-[#15130f]/20 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
      >
        <Pencil className="size-3" />
        Edit
      </Link>
      <Link
        href={`/studio/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-[#b8770a]"
      >
        Open
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

export function StudioProjectsList({ projects }: { projects: StudioProjectRow[] }) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      <div className="hidden overflow-x-auto border border-[#15130f]/12 bg-white md:block">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-[#15130f]/12 bg-[#f7f4ee]">
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
              <tr key={project.id} className="hover:bg-[#f7f4ee]/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/studio/projects/${project.id}`}
                    className="font-semibold hover:text-[#b8770a]"
                  >
                    {project.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-[#9a9488]">/work/{project.slug}</p>
                </td>
                <td className="px-4 py-3 text-[#57524a]">{project.stackLabel || "—"}</td>
                <td className="px-4 py-3 text-[#57524a]">
                  {project.leadName ?? <span className="text-[#b8770a]">Unassigned</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-[11px] text-[#9a9488]">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ProjectActions project={project} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-[#15130f]/10 border border-[#15130f]/12 bg-white md:hidden">
        {projects.map((project) => (
          <li key={project.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/studio/projects/${project.id}`}
                  className="font-semibold hover:text-[#b8770a]"
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
