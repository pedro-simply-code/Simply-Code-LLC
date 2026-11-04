import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StudioContentFilters } from "~/components/studio/content-filters";
import {
  StudioContentList,
  type StudioContentRow,
} from "~/components/studio/content-list";
import { StudioHeader } from "~/components/studio/ui";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { filterStudioContent } from "~/lib/studio-content-filter";
import { studioContentPanel } from "~/lib/studio-content-surface";
import {
  paginateStudio,
  parseStudioPage,
  studioPageSummary,
} from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";
import { appEmptyState, appPrimaryButtonStudioSm } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { requireContentManager } from "~/server/authz";
import { listContentEntries } from "~/server/content/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content",
};

export default async function ContentIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    kind?: string;
    status?: string;
    view?: string;
    page?: string;
  }>;
}) {
  await requireContentManager();
  const {
    deleted,
    q = "",
    kind = "all",
    status = "all",
    view: viewParam,
    page: pageParam,
  } = await searchParams;
  const view = parseStudioView(viewParam);
  const page = parseStudioPage(pageParam);

  const entries = await listContentEntries();
  const rows: StudioContentRow[] = entries.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    isHomepage: entry.isHomepage,
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    status: entry.status,
    updatedAt: entry.updatedAt,
    publishedAt: entry.publishedAt,
  }));

  const filtered = filterStudioContent(rows, q, kind, status);
  const paginated = paginateStudio(filtered, page);
  const hasFilters =
    Boolean(q.trim()) || kind !== "all" || status !== "all";

  return (
    <div>
      <StudioHeader
        title="Content"
        description="Pages at /{slug}, posts at /blog/{slug}. Homepage and nav options are under Publishing when editing."
        actions={
          <Link
            href="/studio/content/new"
            className={cn(appPrimaryButtonStudioSm, "gap-1.5")}
          >
            <Plus className="size-3.5" /> New content
          </Link>
        }
      />

      {deleted ? (
        <p className="mb-5 rounded-md bg-[#e9f5ec] px-4 py-3 text-sm text-[#1e5c33]">
          Entry deleted.
        </p>
      ) : null}

      <StudioContentFilters />

      <p className="mb-4 text-xs text-[#6f6a60]">
        {paginated.total} of {rows.length}{" "}
        {rows.length === 1 ? "entry" : "entries"}
        {hasFilters ? " matching filters" : ""}
        {paginated.total > 0
          ? ` · ${studioPageSummary(paginated.page, paginated.pageSize, paginated.total)}`
          : ""}
      </p>

      {rows.length === 0 ? (
        <p className={appEmptyState}>
          No pages or posts yet. Start with{" "}
          <Link href="/studio/content/new" className="underline">
            a new page
          </Link>{" "}
          and insert the hero block from the editor toolbar.
        </p>
      ) : paginated.total === 0 ? (
        <p className={`px-4 py-8 text-sm text-[#6f6a60] ${studioContentPanel}`}>
          No content matches your filters.{" "}
          <Link
            href="/studio/content"
            className="text-sc-accent font-semibold hover:underline"
          >
            Clear filters
          </Link>
        </p>
      ) : (
        <>
          <StudioContentList entries={paginated.items} view={view} />
          <StudioPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
          />
        </>
      )}
    </div>
  );
}
