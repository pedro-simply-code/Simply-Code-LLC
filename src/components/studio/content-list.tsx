import Link from "next/link";
import { ArrowRight, ExternalLink, Pencil } from "lucide-react";
import {
  CONTENT_KIND_LABEL,
  CONTENT_STATUS_LABEL,
  contentPublicPath,
  formatContentDate,
  type ContentKindName,
  type ContentStatusName,
} from "~/lib/content";
import {
  studioContentGhostButton,
  studioContentPanel,
} from "~/lib/studio-content-surface";
import type { StudioViewMode } from "~/lib/studio-view";
import { appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type StudioContentRow = {
  id: string;
  kind: ContentKindName;
  isHomepage?: boolean;
  slug: string;
  title: string;
  excerpt: string;
  status: ContentStatusName;
  updatedAt: Date;
  publishedAt: Date | null;
};

function StatusBadge({ status }: { status: ContentStatusName }) {
  const published = status === "published";
  return (
    <span
      className={
        published
          ? "rounded-md bg-[#e8f5e9] px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase"
          : "bg-sc-section-alt rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase shadow-[0_1px_2px_rgba(21,19,15,0.05)]"
      }
    >
      {CONTENT_STATUS_LABEL[status]}
    </span>
  );
}

function ContentActions({ entry }: { entry: StudioContentRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {entry.status === "published" ? (
        <Link
          href={contentPublicPath(
            entry.kind,
            entry.slug,
            entry.isHomepage,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 ${studioContentGhostButton}`}
        >
          <ExternalLink className="size-3" />
          Public
        </Link>
      ) : null}
      <Link
        href={`/studio/content/${entry.id}`}
        className={`inline-flex items-center gap-1.5 ${studioContentGhostButton}`}
      >
        <Pencil className="size-3" />
        Edit
      </Link>
      <Link
        href={`/studio/content/${entry.id}`}
        className="hover:bg-sc-accent inline-flex items-center gap-1.5 rounded-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
      >
        Open
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function ContentGridCard({ entry }: { entry: StudioContentRow }) {
  return (
    <article className={cn(appPanel, appPanelHover, "flex flex-col p-4")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/studio/content/${entry.id}`}
            className="hover:text-sc-accent font-semibold"
          >
            {entry.title}
          </Link>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[#9a9488]">
            {contentPublicPath(
              entry.kind,
              entry.slug,
              entry.isHomepage,
            )}
          </p>
        </div>
        <StatusBadge status={entry.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-[11px]">
        <div>
          <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">
            Type
          </dt>
          <dd className="mt-0.5 text-[#57524a]">
            {CONTENT_KIND_LABEL[entry.kind]}
          </dd>
        </div>
        {entry.excerpt ? (
          <div>
            <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">
              Excerpt
            </dt>
            <dd className="mt-0.5 line-clamp-2 text-[#57524a]">
              {entry.excerpt}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-[10px] text-[#9a9488]">
        Updated {formatContentDate(entry.updatedAt)}
      </p>
      <div className="mt-4 border-t border-[#15130f]/8 pt-3">
        <ContentActions entry={entry} />
      </div>
    </article>
  );
}

export function StudioContentList({
  entries,
  view = "list",
}: {
  entries: StudioContentRow[];
  view?: StudioViewMode;
}) {
  if (entries.length === 0) {
    return null;
  }

  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <ContentGridCard key={entry.id} entry={entry} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`hidden overflow-x-auto md:block ${studioContentPanel}`}>
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[38%]" />
          </colgroup>
          <thead className="bg-sc-canvas/95">
            <tr className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15130f]/10">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-sc-section-alt/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/studio/content/${entry.id}`}
                    className="hover:text-sc-accent font-semibold"
                  >
                    {entry.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-[#9a9488]">
                    {contentPublicPath(
              entry.kind,
              entry.slug,
              entry.isHomepage,
            )}
                  </p>
                </td>
                <td className="px-4 py-3 text-[#57524a]">
                  {CONTENT_KIND_LABEL[entry.kind]}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-3 text-[11px] whitespace-nowrap text-[#9a9488]">
                  {formatContentDate(entry.updatedAt)}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-end gap-1.5">
                    <ContentActions entry={entry} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul
        className={`divide-y divide-[#15130f]/8 md:hidden ${studioContentPanel}`}
      >
        {entries.map((entry) => (
          <li key={entry.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/studio/content/${entry.id}`}
                  className="hover:text-sc-accent font-semibold"
                >
                  {entry.title}
                </Link>
                <p className="mt-0.5 font-mono text-[11px] text-[#9a9488]">
                  {contentPublicPath(
              entry.kind,
              entry.slug,
              entry.isHomepage,
            )}
                </p>
              </div>
              <StatusBadge status={entry.status} />
            </div>
            <p className="mt-2 text-[11px] text-[#57524a]">
              {CONTENT_KIND_LABEL[entry.kind]}
            </p>
            <p className="mt-2 text-[10px] text-[#9a9488]">
              Updated {formatContentDate(entry.updatedAt)}
            </p>
            <div className="mt-3">
              <ContentActions entry={entry} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
