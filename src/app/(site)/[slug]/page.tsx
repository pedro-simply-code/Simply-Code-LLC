import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import {
  contentPlainText,
  contentPublicPath,
  type ContentDocument,
} from "~/lib/content";
import { getPublishedEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

type SiteSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SiteSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  if (entry.isHomepage) {
    return {
      title: entry.title,
      robots: { index: false, follow: true },
      alternates: { canonical: "/" },
    };
  }

  const canonical = contentPublicPath("page", entry.slug, entry.isHomepage);
  const description =
    entry.excerpt ||
    contentPlainText(entry.body as ContentDocument).slice(0, 160);

  return {
    title: entry.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: entry.title,
      description,
      type: "website",
      ...(entry.coverImageUrl
        ? { images: [{ url: entry.coverImageUrl, alt: entry.title }] }
        : {}),
    },
  };
}

export default async function SiteSlugCmsPage({ params }: SiteSlugPageProps) {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

  if (entry.isHomepage) {
    permanentRedirect("/");
  }

  return <CmsDocumentPage entry={entry} />;
}
