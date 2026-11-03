import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import {
  contentPlainText,
  isHomepageCmsSlug,
  type ContentDocument,
} from "~/lib/content";
import { getPublishedEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isHomepageCmsSlug(slug)) {
    return {
      title: "Home",
      alternates: { canonical: "/" },
      robots: { index: false, follow: true },
    };
  }

  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  const description =
    entry.excerpt ||
    contentPlainText(entry.body as ContentDocument).slice(0, 160);

  return {
    title: entry.title,
    description,
    alternates: { canonical: `/page/${entry.slug}` },
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

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;

  if (isHomepageCmsSlug(slug)) {
    permanentRedirect("/");
  }

  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

  return <CmsDocumentPage entry={entry} />;
}
