import { ContentRenderer } from "~/components/content/content-renderer";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import type { ContentDocument } from "~/lib/content";
import type { ContentEntry } from "~/server/db/schema";

/** Public layout for a published CMS page or post body (Lexical JSON). */
export function CmsDocumentPage({ entry }: { entry: ContentEntry }) {
  const body = entry.body as ContentDocument;

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNav />

      <article className="mx-auto w-full">
        <ContentRenderer document={body} />
      </article>

      <SiteFooter />
    </div>
  );
}
