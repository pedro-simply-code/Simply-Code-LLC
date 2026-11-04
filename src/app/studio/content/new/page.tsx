import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentEditor } from "~/components/lexical/content-editor";
import { ContentEditorWorkspace } from "~/components/content/content-editor-workspace";
import { StudioHeader } from "~/components/studio/ui";
import { contentErrorMessage, contentPublicPath } from "~/lib/content";
import { requireContentManager } from "~/server/authz";
import { createContentEntry } from "~/server/content/actions";
import { getPublishedHomepageEntrySafe } from "~/server/content/queries";
import { getPublicProjectsSafe } from "~/server/studio/queries";

export const metadata: Metadata = {
  title: "New content",
};

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireContentManager();
  const { error } = await searchParams;
  const message = contentErrorMessage(error);

  const publishedHomepage = await getPublishedHomepageEntrySafe();
  const previewProjects = (await getPublicProjectsSafe()) ?? [];
  const currentHomepage = publishedHomepage
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

  return (
    <div>
      <Link
        href="/studio/content"
        className="text-sc-muted hover:text-sc-ink mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All content
      </Link>

      <StudioHeader
        title="New content"
        description="Pages publish at /{slug}; posts at /blog/{slug}. Set homepage and nav options under Publishing."
      />

      {message ? (
        <p className="mb-5 rounded-md bg-[#fbeaea] px-4 py-3 text-sm text-[#8a2424]">
          {message}
        </p>
      ) : null}

      <form action={createContentEntry} className="space-y-6">
        <ContentEditorWorkspace
          header={{}}
          sidebar={{ currentHomepage }}
          editor={<ContentEditor previewProjects={previewProjects} />}
          submitLabel="Save content"
          cancelHref="/studio/content"
        />
      </form>
    </div>
  );
}
