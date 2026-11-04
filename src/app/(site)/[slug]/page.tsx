import { notFound, permanentRedirect } from "next/navigation";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { getPublishedEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

type SiteSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SiteSlugCmsPage({ params }: SiteSlugPageProps) {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

  if (entry.isHomepage) {
    permanentRedirect("/");
  }

  return <CmsDocumentPage entry={entry} />;
}
