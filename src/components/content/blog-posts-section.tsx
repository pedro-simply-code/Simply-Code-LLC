import type { ReactNode } from "react";
import { BlogPostsListing } from "~/components/content/blog-posts-listing";
import type { BlogSectionData } from "~/lib/site-page-sections";
import { appSectionBand, appSectionContainer } from "~/lib/surface";
import { cn } from "~/lib/utils";
import type { PublicContentSummary } from "~/server/content/queries";

export function BlogPostsSection({
  data,
  posts,
  className,
  emptyMessageOverride,
}: {
  data: BlogSectionData;
  posts: PublicContentSummary[];
  className?: string;
  emptyMessageOverride?: ReactNode;
}) {
  return (
    <section id="blog-posts" className={cn(appSectionBand, className)}>
      <div className={appSectionContainer}>
        <BlogPostsListing
          data={data}
          posts={posts}
          emptyMessageOverride={emptyMessageOverride}
        />
      </div>
    </section>
  );
}
