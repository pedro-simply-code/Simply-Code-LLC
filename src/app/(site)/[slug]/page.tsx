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
  contentStartsWithHero,
  formatContentDate,
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
    alternates: { canonical: `/${entry.slug}` },
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
  const heroLayout = contentStartsWithHero(body);

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNav />

      <article className={heroLayout ? "pb-16" : "pt-14 pb-16 lg:pt-20"}>
        {heroLayout ? null : (
          <header className="mx-auto w-full max-w-[860px] px-6">
            <Link
              href="/"
              className="text-sc-muted hover:text-sc-ink inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back home
            </Link>
            <h1 className="mt-6 text-[clamp(2.1rem,4.5vw,3.4rem)] leading-[1.03] font-black tracking-[-0.035em] uppercase">
              {entry.title}
            </h1>
            {entry.excerpt ? (
              <p className="mt-5 text-[17px] leading-relaxed text-[#57524a]">
                {entry.excerpt}
              </p>
            ) : null}
            {entry.publishedAt ? (
              <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
                Updated {formatContentDate(entry.publishedAt)}
              </p>
            ) : null}
          </header>
        )}

        <ContentRenderer
          document={body}
          className={heroLayout ? undefined : "mt-10"}
        />
      </article>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
