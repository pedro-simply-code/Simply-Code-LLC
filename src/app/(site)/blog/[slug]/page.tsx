import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentRenderer } from "~/components/content/content-renderer";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import {
  contentPlainText,
  contentReadingTime,
  formatContentDate,
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
      <SiteNav />

      <article className="pt-14 pb-16 lg:pt-20">
        <header className="mx-auto w-full max-w-[860px] px-6">
          <Link
            href="/blog"
            className="text-sc-muted hover:text-sc-ink inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
          >
            <ArrowLeft className="size-3.5" /> All posts
          </Link>
          <p className="text-sc-accent mt-6 text-[11px] font-bold tracking-[0.22em] uppercase">
            Blog
            <span className="mx-2 text-[#a8a29a]">·</span>
            {formatContentDate(entry.publishedAt ?? entry.updatedAt)}
            <span className="mx-2 text-[#a8a29a]">·</span>
            {contentReadingTime(body)} min read
          </p>
          <h1 className="mt-4 text-[clamp(2.1rem,4.5vw,3.4rem)] leading-[1.03] font-black tracking-[-0.035em] uppercase">
            {entry.title}
          </h1>
          {entry.excerpt ? (
            <p className="mt-5 text-[17px] leading-relaxed text-[#57524a]">
              {entry.excerpt}
            </p>
          ) : null}
        </header>

        <ContentRenderer document={body} className="mt-10" />
      </article>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
