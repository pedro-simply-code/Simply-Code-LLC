import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { formatContentDate } from "~/lib/content";
import { appEmptyState, appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { listPublishedEntriesSafe } from "~/server/content/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on web engineering, design systems, performance and shipping products.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedEntriesSafe("post");

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNavShell />

      <section className="border-b border-[#15130f]/10">
        <div className="mx-auto max-w-[1400px] px-6 py-16 lg:py-24">
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            Blog
          </p>
          <h1 className="mt-5 max-w-[22ch] text-[clamp(2.2rem,4.8vw,3.6rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
            Notes from the build
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]">
            Engineering decisions, design details and lessons from shipping
            production web products.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          {posts.length === 0 ? (
            <p className={appEmptyState}>
              No posts published yet. Check back soon.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={cn(
                    appPanel,
                    appPanelHover,
                    "group flex flex-col overflow-hidden",
                  )}
                >
                  <div
                    aria-hidden
                    className="h-36 bg-[#15130f] bg-cover bg-center"
                    style={
                      post.coverImageUrl
                        ? { backgroundImage: `url(${post.coverImageUrl})` }
                        : undefined
                    }
                  >
                    {post.coverImageUrl ? null : (
                      <div className="from-sc-accent-bright/30 flex h-full items-center justify-center bg-gradient-to-br to-[#15130f]">
                        <span className="text-sc-accent-bright text-[34px] leading-none font-black tracking-[-0.08em]">
                          {"</>"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6f6a60] uppercase">
                      {formatContentDate(post.publishedAt ?? post.updatedAt)}
                      <span className="mx-2">·</span>
                      {post.readingMinutes} min read
                    </p>
                    <h2 className="mt-3 text-[1.35rem] leading-tight font-black tracking-[-0.02em]">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#57524a]">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sc-accent mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase"
                    >
                      Read post <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
