import type { Metadata } from "next";
import { ContentMediaStudioPage } from "~/components/studio/content-media-studio-page";
import { StudioHeader } from "~/components/studio/ui";
import { requireContentManager } from "~/server/authz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media library · Content",
};

export default async function ContentMediaLibraryPage() {
  await requireContentManager();

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-6">
      <StudioHeader
        title="Media library"
        description="Images uploaded for CMS content (covers and in-editor media). Upload, browse, and copy URLs."
      />
      <div className="min-h-0 flex-1">
        <ContentMediaStudioPage />
      </div>
    </div>
  );
}
