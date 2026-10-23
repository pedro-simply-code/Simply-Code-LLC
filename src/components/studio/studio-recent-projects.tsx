import Link from "next/link";
import {
  overviewPreviewGridClass,
  overviewPreviewListClass,
  overviewPreviewListItemClass,
  overviewPreviewListMobileOnlyClass,
  overviewPreviewSlotsShellClass,
} from "~/components/studio/studio-overview-column";
import { EmptyState } from "~/components/studio/ui";
import { padStudioOverviewPreview } from "~/lib/studio-pagination";
import type { StudioViewMode } from "~/lib/studio-view";
import { appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

type RecentProject = {
  id: string;
  title: string;
  summary?: string;
  stackLabel: string;
  status: string;
  clientName?: string | null;
  leadName?: string | null;
  leadEmail?: string | null;
  updatedAt: Date;
};

const overviewProjectGhost: RecentProject = {
  id: "__overview-project-ghost__",
  title: "Project title",
  summary: "Short project summary for layout preview.",
  stackLabel: "React, TypeScript, PostgreSQL",
  status: "published",
  clientName: "Art Dark",
  leadName: "Ryan",
  updatedAt: new Date(0),
};

function overviewProjectLeadLabel(project: RecentProject) {
  return project.leadName ?? project.leadEmail ?? "Unassigned";
}

function OverviewProjectMetaLine({
  label,
  value,
  capitalizeValue = false,
}: {
  label: string;
  value: string;
  capitalizeValue?: boolean;
}) {
  return (
    <p className="text-[11px] leading-snug text-[#57524a]">
      <span className="font-bold text-[#15130f]">{label}:</span>{" "}
      <span className={cn("text-[#57524a]", capitalizeValue && "capitalize")}>{value}</span>
    </p>
  );
}

function OverviewProjectSummary({ summary }: { summary?: string }) {
  const text = summary?.trim();
  if (!text) return null;

  return <p className="mt-px line-clamp-1 text-[11px] leading-snug text-[#6f6a60]">{text}</p>;
}

function OverviewProjectMeta({ project }: { project: RecentProject }) {
  const statusLabel = project.status.replace(/_/g, " ");

  return (
    <div className="mt-1 space-y-1">
      <p className="line-clamp-1 text-[11px] leading-snug text-[#6f6a60]">
        {project.stackLabel || "No stack"}
      </p>
      <div className="space-y-0.5 border-t border-[#15130f]/8 pt-1">
        <OverviewProjectMetaLine label="Lead" value={overviewProjectLeadLabel(project)} />
        <OverviewProjectMetaLine label="Status" value={statusLabel} capitalizeValue />
        {project.clientName ? (
          <OverviewProjectMetaLine label="Client" value={project.clientName} />
        ) : null}
      </div>
    </div>
  );
}

function overviewProjectGridCellClass() {
  return cn(
    appPanel,
    appPanelHover,
    "flex h-full min-h-0 flex-col justify-between gap-1.5 p-3",
  );
}

function OverviewProjectCell({
  project,
  asLink = true,
}: {
  project: RecentProject;
  asLink?: boolean;
}) {
  const inner = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-semibold hover:text-sc-accent">{project.title}</p>
        <OverviewProjectSummary summary={project.summary} />
        <OverviewProjectMeta project={project} />
      </div>
      <p className="mt-1 text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
        {new Date(project.updatedAt).toLocaleDateString()}
      </p>
    </>
  );

  if (!asLink) {
    return <div className={overviewProjectGridCellClass()}>{inner}</div>;
  }

  return (
    <Link href={`/studio/projects/${project.id}`} className={overviewProjectGridCellClass()}>
      {inner}
    </Link>
  );
}

function OverviewProjectListRow({
  project,
  asLink = true,
}: {
  project: RecentProject;
  asLink?: boolean;
}) {
  const title = asLink ? (
    <Link
      href={`/studio/projects/${project.id}`}
      className="text-sm font-semibold hover:text-sc-accent"
    >
      {project.title}
    </Link>
  ) : (
    <p className="text-sm font-semibold">{project.title}</p>
  );

  return (
    <>
      <div className="min-w-0">
        {title}
        <OverviewProjectSummary summary={project.summary} />
        <OverviewProjectMeta project={project} />
      </div>
      <span className="mt-0.5 block text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
        {new Date(project.updatedAt).toLocaleDateString()}
      </span>
    </>
  );
}

export function StudioRecentProjects({
  projects,
  view,
  compact = false,
  emptyMessage,
}: {
  projects: RecentProject[];
  view: StudioViewMode;
  /** Single-column grid / tighter list (e.g. overview three-column layout). */
  compact?: boolean;
  /** When compact and there are no projects, shown over invisible placeholder slots. */
  emptyMessage?: string;
}) {
  if (view === "grid") {
    if (compact) {
      const slots = padStudioOverviewPreview(projects);
      const hasProjects = projects.length > 0;

      return (
        <div className={overviewPreviewSlotsShellClass}>
          {!hasProjects && emptyMessage ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2">
              <EmptyState>{emptyMessage}</EmptyState>
            </div>
          ) : null}
          <ul className={overviewPreviewListMobileOnlyClass}>
            {slots.map((project, index) => {
              const key = project?.id ?? `project-slot-${index}`;
              if (!project) {
                return (
                  <li
                    key={key}
                    className={cn(
                      overviewPreviewListItemClass,
                      "invisible pointer-events-none select-none",
                    )}
                    aria-hidden
                  >
                    <OverviewProjectListRow project={overviewProjectGhost} asLink={false} />
                  </li>
                );
              }
              return (
                <li key={key} className={overviewPreviewListItemClass}>
                  <OverviewProjectListRow project={project} />
                </li>
              );
            })}
          </ul>
          <div className={overviewPreviewGridClass}>
            {slots.map((project, index) => {
              const key = project?.id ?? `project-grid-slot-${index}`;
              if (!project) {
                return (
                  <div
                    key={key}
                    className="invisible pointer-events-none select-none"
                    aria-hidden
                  >
                    <OverviewProjectCell project={overviewProjectGhost} asLink={false} />
                  </div>
                );
              }
              return <OverviewProjectCell key={key} project={project} />;
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/studio/projects/${project.id}`}
            className={cn(appPanel, appPanelHover, "block p-4")}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold hover:text-sc-accent">{project.title}</p>
              <p className="mt-1 text-[11px] text-[#6f6a60]">
                {project.stackLabel || "No stack"} · {project.status}
              </p>
            </div>
            <p className="mt-2 text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    );
  }

  if (compact) {
    const slots = padStudioOverviewPreview(projects);
    const hasProjects = projects.length > 0;

    return (
      <div className={overviewPreviewSlotsShellClass}>
        {!hasProjects && emptyMessage ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2">
            <EmptyState>{emptyMessage}</EmptyState>
          </div>
        ) : null}
        <ul className={overviewPreviewListClass}>
          {slots.map((project, index) => {
            const key = project?.id ?? `project-list-slot-${index}`;
            if (!project) {
              return (
                <li
                  key={key}
                  className={cn(
                    overviewPreviewListItemClass,
                    "invisible pointer-events-none select-none",
                  )}
                  aria-hidden
                >
                  <OverviewProjectListRow project={overviewProjectGhost} asLink={false} />
                </li>
              );
            }
            return (
              <li key={key} className={overviewPreviewListItemClass}>
                <OverviewProjectListRow project={project} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#15130f]/10">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div>
            <Link
              href={`/studio/projects/${project.id}`}
              className="text-sm font-semibold hover:text-sc-accent"
            >
              {project.title}
            </Link>
            <p className="mt-0.5 text-[11px] text-[#6f6a60]">
              {project.stackLabel || "No stack"} · {project.status}
            </p>
          </div>
          <span className="text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
