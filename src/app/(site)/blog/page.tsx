import type { Metadata } from "next";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { BlogPostsSection } from "~/components/content/blog-posts-section";
import { PageHeaderSection } from "~/components/content/page-header-section";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import {
  DEFAULT_BLOG_PAGE_HEADER_SECTION,
  DEFAULT_BLOG_SECTION,
} from "~/lib/content";
import { pageMetadata } from "~/lib/seo";
import { getPublishedCmsPageOverride } from "~/server/content/cms-site-page";
import { listPublishedEntriesSafe } from "~/server/content/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedCmsPageOverride("blog");
  if (cms) {
    return pageMetadata({
      title: cms.title,
      description: cms.excerpt || cms.title,
      path: "/blog",
    });
  }
  return pageMetadata({
    title: "Blog",
    description:
      "Notes on web engineering, design systems, performance and shipping products.",
    path: "/blog",
  });
}

export default async function BlogIndexPage() {
  const cms = await getPublishedCmsPageOverride("blog");
  if (cms) {
    return <CmsDocumentPage entry={cms} />;
  }

  const posts = await listPublishedEntriesSafe("post");

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNavShell />

      <PageHeaderSection data={DEFAULT_BLOG_PAGE_HEADER_SECTION} />
      <BlogPostsSection data={DEFAULT_BLOG_SECTION} posts={posts} />

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
