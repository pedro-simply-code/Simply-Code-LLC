"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote, Star } from "lucide-react";
import { UPWORK_PROFILE_URL, type Testimonial } from "~/content/testimonials";
import {
  testimonialRatingMeta,
  testimonialRatingScreenReader,
  testimonialsIncludeUpwork,
} from "~/lib/reviews";
import { appIconButton, appPanelMuted } from "~/lib/surface";
import { cn } from "~/lib/utils";

function getPerPage() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

/**
 * Fallback-only layout fill: when the bundled static reviews are shown, repeat
 * the last review so every page keeps a full row. DB-backed reviews render as-is.
 */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className={cn(appPanelMuted, "flex h-full flex-col p-8")}>
      <div className="flex items-center justify-between gap-4">
        <Quote className="text-sc-accent-bright size-7" aria-hidden />
        <div
          className="text-sc-accent-bright flex items-center gap-1"
          aria-hidden
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-3.5 fill-current" />
          ))}
        </div>
        <span className="sr-only">
          {testimonialRatingScreenReader(
            testimonial.rating,
            testimonial.source,
          )}
        </span>
      </div>

      <blockquote className="mt-5 flex-1 text-[16px] leading-relaxed text-[#15130f]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-6 border-t border-[#15130f]/10 pt-4">
        <p className="text-[14px] font-bold tracking-tight">
          {testimonial.project}
        </p>
        <p className="mt-0.5 text-[12px] text-[#6f6a60]">
          {testimonialRatingMeta(
            testimonial.rating,
            testimonial.period,
            testimonial.source,
          )}
        </p>
        {testimonial.projectSlug ? (
          <Link
            href={`/work/${testimonial.projectSlug}`}
            className="hover:text-sc-accent mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase underline underline-offset-4"
          >
            View project <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function TestimonialsCarousel({
  testimonials,
  fillLast = false,
}: {
  testimonials: Testimonial[];
  fillLast?: boolean;
}) {
  const [perPage, setPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setPerPage(getPerPage());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const items = useMemo(() => {
    if (!fillLast || testimonials.length === 0) return testimonials;
    // Only fill the short static list; once there are 6+ real reviews, show them as-is.
    if (testimonials.length >= 6) return testimonials;
    const remainder = testimonials.length % perPage;
    if (remainder === 0) return testimonials;
    const last = testimonials[testimonials.length - 1]!;
    return [
      ...testimonials,
      ...Array.from({ length: perPage - remainder }, () => last),
    ];
  }, [testimonials, perPage, fillLast]);

  const pages = useMemo(() => {
    const groups: Testimonial[][] = [];
    for (let index = 0; index < items.length; index += perPage) {
      groups.push(items.slice(index, index + perPage));
    }
    return groups;
  }, [items, perPage]);

  const showUpworkLink = testimonialsIncludeUpwork(testimonials);

  const totalPages = pages.length;
  const current = Math.min(page, Math.max(totalPages - 1, 0));
  const canGoBack = current > 0;
  const canGoForward = current < totalPages - 1;

  const goTo = (next: number) => {
    setPage(Math.max(0, Math.min(totalPages - 1, next)));
  };

  return (
    <div>
      <div
        className="overflow-hidden"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta =
            (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
          touchStart.current = null;
          if (Math.abs(delta) > 50) goTo(current + (delta < 0 ? 1 : -1));
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {pages.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="w-full shrink-0"
              aria-hidden={groupIndex !== current}
              inert={groupIndex !== current}
            >
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))`,
                }}
              >
                {group.map((testimonial, itemIndex) => (
                  <TestimonialCard
                    key={`${testimonial.project}-${testimonial.period}-${groupIndex}-${itemIndex}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(totalPages).padStart(2, "0")}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={!canGoBack}
            aria-label="Previous reviews"
            className={cn(
              appIconButton,
              "hover:text-sc-accent size-10 text-[#15130f] disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={!canGoForward}
            aria-label="Next reviews"
            className={cn(
              appIconButton,
              "hover:text-sc-accent size-10 text-[#15130f] disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {showUpworkLink ? (
        <a
          href={UPWORK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sc-accent mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-[#15130f] uppercase underline underline-offset-4 transition-colors"
        >
          Read all reviews on Upwork <ArrowUpRight className="size-3" />
        </a>
      ) : null}
    </div>
  );
}
