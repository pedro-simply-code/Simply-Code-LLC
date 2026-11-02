import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentRenderer } from "~/components/content/content-renderer";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import {
  contentPlainText,
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
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

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

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
