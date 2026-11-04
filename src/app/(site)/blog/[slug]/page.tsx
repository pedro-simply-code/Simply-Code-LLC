import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentRenderer } from "~/components/content/content-renderer";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import {
  contentPlainText,
  type ContentDocument,
} from "~/lib/content";
import { getPublishedEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

type PostProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("post", slug);

  if (!entry) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }

  const description =
    entry.excerpt ||
    contentPlainText(entry.body as ContentDocument).slice(0, 160);

  return {
    title: `${entry.title} — Blog`,
    description,
    alternates: { canonical: `/blog/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description,
      type: "article",
      ...(entry.publishedAt
        ? { publishedTime: entry.publishedAt.toISOString() }
        : {}),
      ...(entry.coverImageUrl
        ? { images: [{ url: entry.coverImageUrl, alt: entry.title }] }
        : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PostProps) {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("post", slug);

  if (!entry) notFound();

  const body = entry.body as ContentDocument;

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNavShell />

      <article className="mx-auto w-full">
        <ContentRenderer document={body} />
      </article>

      <SiteFooter />
    </div>
  );
}
