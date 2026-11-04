import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatContentDate } from "~/lib/content";
import type { PublicContentSummary } from "~/server/content/queries";

type PostCardProps = {
  post: PublicContentSummary;
  showSummary?: boolean;
};

export function PostCard({ post, showSummary = true }: PostCardProps) {
  const dateLabel = formatContentDate(post.publishedAt ?? post.updatedAt);

  return (
    <article className="site-reveal group flex flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="focus-visible:outline-sc-accent flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="from-sc-accent-bright to-sc-accent relative aspect-[1000/560] overflow-hidden rounded-lg bg-gradient-to-br shadow-[0_2px_12px_rgba(21,19,15,0.08)]">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={`${post.title} cover`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-15">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
                <div key={cell} className="bg-white/40" />
              ))}
            </div>
          )}

          <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-[#15130f]/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Read post <ArrowUpRight className="size-3" />
          </span>
        </div>

        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-4">
            <h3 className="group-hover:text-sc-accent text-lg font-bold tracking-tight transition-colors">
              {post.title}
            </h3>
            <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
              {post.readingMinutes} min
            </span>
          </div>

          {showSummary && post.excerpt ? (
            <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
              {post.excerpt}
            </p>
          ) : null}

          <p className="mt-4 text-[11px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            {dateLabel}
          </p>
        </div>
      </Link>
    </article>
  );
}
