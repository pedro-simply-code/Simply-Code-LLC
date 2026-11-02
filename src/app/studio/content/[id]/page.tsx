import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ContentFormFields } from "~/components/content/content-form-fields";
import { DeleteContentForm } from "~/components/content/delete-content-form";
import { ContentEditor } from "~/components/lexical/content-editor";
import { StudioCard, StudioHeader } from "~/components/studio/ui";
import {
  contentErrorMessage,
  contentHref,
  formatContentDate,
  type ContentDocument,
} from "~/lib/content";
import { appOutlineButton, appPrimaryButtonStudioSm } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { requireContentManager } from "~/server/authz";
import { deleteContentEntry, saveContentEntry } from "~/server/content/actions";
import { getContentEntry } from "~/server/content/queries";

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

  const message = contentErrorMessage(error);
  const formId = `content-form-${entry.id}`;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/studio/content"
        className="text-sc-muted hover:text-sc-ink mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All content
      </Link>

      <StudioHeader
        title="Edit content"
        description={`${entry.kind === "post" ? "Post" : "Page"} · ${contentHref(entry.kind, entry.slug)} · updated ${formatContentDate(entry.updatedAt)}`}
        actions={
          entry.status === "published" ? (
            <Link
              href={contentHref(entry.kind, entry.slug)}
              target="_blank"
              className={cn(appPrimaryButtonStudioSm, "gap-1.5")}
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

      <form id={formId} action={saveContentEntry} className="grid gap-6">
        <input type="hidden" name="id" value={entry.id} />

        <StudioCard
          title="Details"
          description="Changing the slug changes the public URL. Old links are not redirected."
        >
          <ContentFormFields
            kind={entry.kind}
            status={entry.status}
            title={entry.title}
            slug={entry.slug}
            excerpt={entry.excerpt}
            coverImageUrl={entry.coverImageUrl ?? ""}
          />
        </StudioCard>

        <StudioCard title="Body">
          <ContentEditor
            initialDocument={entry.body as ContentDocument}
            namespace={`content-${entry.id}`}
          />
        </StudioCard>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" form={formId} className={appOutlineButton}>
            Save changes
          </button>
          <Link
            href={`/studio/content/${entry.id}`}
            className={cn(appOutlineButton)}
          >
            Reset
          </Link>
        </div>

        <DeleteContentForm
          action={deleteContentEntry}
          id={entry.id}
          label={entry.title}
        />
      </div>
    </div>
  );
}
