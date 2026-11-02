import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { StudioHeader } from "~/components/studio/ui";
import {
  CONTENT_KIND_LABEL,
  CONTENT_STATUS_LABEL,
  contentHref,
  formatContentDate,
} from "~/lib/content";
import {
  appChipMuted,
  appEmptyState,
  appPanel,
  appPanelHover,
  appPrimaryButtonStudioSm,
} from "~/lib/surface";
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
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireContentManager();
  const { deleted } = await searchParams;
  const entries = await listContentEntries();

  const pages = entries.filter((entry) => entry.kind === "page").length;
  const posts = entries.filter((entry) => entry.kind === "post").length;

  return (
    <div>
      <StudioHeader
        title="Content"
        description="Create pages and blog posts with the Lexical editor. Pages publish at the site root, posts under /blog. The hero block can be inserted into any entry and edited in place."
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

      <div className="mb-6 flex flex-wrap gap-2">
        <span className={appChipMuted}>{entries.length} total</span>
        <span className={appChipMuted}>{pages} pages</span>
        <span className={appChipMuted}>{posts} posts</span>
      </div>

      {entries.length === 0 ? (
        <p className={appEmptyState}>
          No pages or posts yet. Start with{" "}
          <Link href="/studio/content/new" className="underline">
            a new page
          </Link>{" "}
          and insert the hero block from the editor toolbar.
        </p>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className={cn(appPanel, appPanelHover, "p-4 sm:p-5")}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={appChipMuted}>
                      {CONTENT_KIND_LABEL[entry.kind]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase",
                        entry.status === "published"
                          ? "bg-[#e9f5ec] text-[#1e5c33]"
                          : "bg-[#f1eee7] text-[#6f6a60]",
                      )}
                    >
                      {CONTENT_STATUS_LABEL[entry.status]}
                    </span>
                    <span className="font-mono text-[11px] text-[#6f6a60]">
                      {contentHref(entry.kind, entry.slug)}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg leading-tight font-black tracking-[-0.02em]">
                    <Link
                      href={`/studio/content/${entry.id}`}
                      className="hover:text-sc-accent transition-colors"
                    >
                      {entry.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-[#6f6a60]">
                    Updated {formatContentDate(entry.updatedAt)}
                    {entry.publishedAt
                      ? ` · Published ${formatContentDate(entry.publishedAt)}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {entry.status === "published" ? (
                    <Link
                      href={contentHref(entry.kind, entry.slug)}
                      target="_blank"
                      className={cn(appPrimaryButtonStudioSm, "gap-1.5")}
                    >
                      <ExternalLink className="size-3.5" /> View
                    </Link>
                  ) : null}
                  <Link
                    href={`/studio/content/${entry.id}`}
                    className={cn(appPrimaryButtonStudioSm, "gap-1.5")}
                  >
                    <FileText className="size-3.5" /> Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
