import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentFormFields } from "~/components/content/content-form-fields";
import { ContentEditor } from "~/components/lexical/content-editor";
import { StudioCard, StudioHeader } from "~/components/studio/ui";
import { contentErrorMessage } from "~/lib/content";
import { appOutlineButton, appPrimaryButtonStudio } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { requireContentManager } from "~/server/authz";
import { createContentEntry } from "~/server/content/actions";

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

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/studio/content"
        className="text-sc-muted hover:text-sc-ink mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All content
      </Link>

      <StudioHeader
        title="New content"
        description="Write a page or a blog post. Use “Insert hero block” in the editor toolbar to add the homepage hero and edit it in place."
      />

      {message ? (
        <p className="mb-5 rounded-md bg-[#fbeaea] px-4 py-3 text-sm text-[#8a2424]">
          {message}
        </p>
      ) : null}

      <form action={createContentEntry} className="grid gap-6">
        <StudioCard
          title="Details"
          description="Pages publish at the root, posts under /blog. Drafts stay hidden from the public site."
        >
          <ContentFormFields />
        </StudioCard>

        <StudioCard title="Body">
          <ContentEditor />
        </StudioCard>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={appPrimaryButtonStudio}>
            Save content
          </button>
          <Link href="/studio/content" className={cn(appOutlineButton)}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
