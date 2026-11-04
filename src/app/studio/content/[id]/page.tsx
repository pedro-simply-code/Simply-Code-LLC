import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ContentEditorWorkspace } from "~/components/content/content-editor-workspace";
import { DeleteContentForm } from "~/components/content/delete-content-form";
import { ContentEditor } from "~/components/lexical/content-editor";
import { StudioHeader } from "~/components/studio/ui";
import {
  contentErrorMessage,
  contentPublicPath,
  formatContentDate,
  type ContentDocument,
} from "~/lib/content";
import { requireContentManager } from "~/server/authz";
import { deleteContentEntry, saveContentEntry } from "~/server/content/actions";
import {
  getContentEntry,
  getPublishedHomepageEntrySafe,
} from "~/server/content/queries";
import { getPublicProjectsSafe } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit content",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  await requireContentManager();

  const { id } = await params;
  const { error, saved, created } = await searchParams;

  if (!UUID.test(id)) notFound();

  const entry = await getContentEntry(id);
  if (!entry) notFound();

  const publishedHomepage = await getPublishedHomepageEntrySafe();
  const currentHomepage =
    publishedHomepage && publishedHomepage.id !== entry.id
      ? {
          id: publishedHomepage.id,
          title: publishedHomepage.title,
          href: contentPublicPath(
            "page",
            publishedHomepage.slug,
            publishedHomepage.isHomepage,
          ),
        }
      : null;

  const message = contentErrorMessage(error);

  const publicPath = contentPublicPath(
    entry.kind,
    entry.slug,
    entry.isHomepage,
  );

  const previewProjects = (await getPublicProjectsSafe()) ?? [];

  return (
    <div>
      <Link
        href="/studio/content"
        className="text-sc-muted hover:text-sc-ink mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All content
      </Link>

      <StudioHeader
        title="Edit content"
        description={`${entry.kind === "post" ? "Post" : "Page"} · ${publicPath} · updated ${formatContentDate(entry.updatedAt)}`}
        actions={
          entry.status === "published" ? (
            <Link
              href={publicPath}
              target="_blank"
              className="hover:bg-sc-accent inline-flex items-center gap-1.5 site-radius-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
            >
              <ExternalLink className="size-3.5" /> View public page
            </Link>
          ) : null
        }
      />

      {created ? (
        <p className="mb-5 rounded-md bg-[#e9f5ec] px-4 py-3 text-sm text-[#1e5c33]">
          Content created.
        </p>
      ) : null}
      {saved ? (
        <p className="mb-5 rounded-md bg-[#e9f5ec] px-4 py-3 text-sm text-[#1e5c33]">
          Changes saved.
        </p>
      ) : null}
      {message ? (
        <p className="mb-5 rounded-md bg-[#fbeaea] px-4 py-3 text-sm text-[#8a2424]">
          {message}
        </p>
      ) : null}

      <form action={saveContentEntry} className="space-y-6">
        <input type="hidden" name="id" value={entry.id} />

        <ContentEditorWorkspace
          header={{ title: entry.title, slug: entry.slug }}
          sidebar={{
            kind: entry.kind,
            status: entry.status,
            excerpt: entry.excerpt,
            coverImageUrl: entry.coverImageUrl ?? "",
            entryId: entry.id,
            isHomepage: entry.isHomepage,
            showInNav: entry.showInNav,
            navLabel: entry.navLabel ?? "",
            currentHomepage,
          }}
          editor={
            <ContentEditor
              initialDocument={entry.body as ContentDocument}
              namespace={`content-${entry.id}`}
              previewProjects={previewProjects}
            />
          }
          submitLabel="Save changes"
          enableDiscard
        />
      </form>

      <div className="mt-6 flex justify-end">
        <DeleteContentForm
          action={deleteContentEntry}
          id={entry.id}
          label={entry.title}
        />
      </div>
    </div>
  );
}
