import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TestimonialsCarousel } from "~/components/testimonials-carousel";
import { appPanelHover, appPanelMuted } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { TESTIMONIALS, type Testimonial } from "~/content/testimonials";
import { clientProofIntro } from "~/lib/reviews";

const OUTCOMES = [
  {
    value: "8 yrs",
    label: "Inside Zoom",
    body: "Development lead for Zoom's WordPress team, with UX guidance across product and marketing properties.",
    href: "/work/zoom",
  },
  {
    value: "5",
    label: "Zoomtopia sites",
    body: "A new branded event site built from scratch each year, from 2020 through 2025.",
    href: "/work/zoomtopia",
  },
  {
    value: "120+",
    label: "Tables in Harmony",
    body: "A full platform rebuild with role-based dashboards for parents, schools and employees.",
    href: "/work/harmony",
  },
];

export function ClientProof({
  testimonials = TESTIMONIALS,
  fillLast = false,
}: {
  testimonials?: Testimonial[];
  fillLast?: boolean;
}) {
  const hasQuotes = testimonials.length > 0;

  return (
    <section
      id="reviews"
      className="bg-sc-section border-b border-[#15130f]/10 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="site-reveal mb-14 max-w-2xl">
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            {hasQuotes ? "Client Feedback" : "Client Outcomes"}
          </p>
          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
            {hasQuotes ? "What Clients Say" : "The Work Speaks First"}
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
            {hasQuotes
              ? clientProofIntro(testimonials, fillLast)
              : "No stock testimonials and no invented metrics. Here is the record, with a case study behind every number."}
          </p>
        </div>

        {hasQuotes ? (
          <TestimonialsCarousel
            testimonials={testimonials}
            fillLast={fillLast}
          />
        ) : (
          <div className="site-stagger grid gap-6 md:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <Link
                key={outcome.label}
                href={outcome.href}
                className={cn(
                  appPanelMuted,
                  appPanelHover,
                  "site-reveal site-motion-lift group flex flex-col p-8",
                )}
              >
                <p className="text-sc-accent text-[42px] leading-none font-black tracking-[-0.03em]">
                  {outcome.value}
                </p>
                <p className="mt-4 text-[11px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
                  {outcome.label}
                </p>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#57524a]">
                  {outcome.body}
                </p>
                <span className="group-hover:text-sc-accent mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase transition-colors">
                  View case study <ArrowUpRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
