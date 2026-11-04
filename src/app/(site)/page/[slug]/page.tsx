import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  contentPlainText,
  contentPublicPath,
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
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  const canonical = contentPublicPath(
    "page",
    entry.slug,
    entry.isHomepage,
  );

  if (entry.isHomepage) {
    return {
      title: entry.title,
      robots: { index: false, follow: true },
      alternates: { canonical: "/" },
    };
  }

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

/** Legacy `/page/{slug}` URLs redirect to `/{slug}`. */
export default async function LegacyPrefixedCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

  permanentRedirect(
    contentPublicPath("page", entry.slug, entry.isHomepage),
  );
}
