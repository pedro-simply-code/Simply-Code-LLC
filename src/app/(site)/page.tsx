import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  Globe,
  Layers,
  Palette,
  Ruler,
  Users,
  Zap,
} from "lucide-react";
import { ClientProof } from "~/components/client-proof";
import { ContactForm } from "~/components/contact-form";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { WorkCard } from "~/components/work-card";
import { PROJECTS } from "~/content/projects";
import { SERVICES } from "~/content/services";
import { TESTIMONIALS } from "~/content/testimonials";
import { normalizeReviewSource } from "~/lib/reviews";
import {
  getApprovedReviewsSafe,
  getPublicProjectsSafe,
} from "~/server/studio/queries";
import {
  appEmptyState,
  appOutlineButton,
  appPrimaryButtonMarketing,
  appPanelMuted,
  appPanelHover,
  appChip,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Simply Code — Web Development Agency" },
  description:
    "Web development agency specializing in UX design, custom Next.js platforms and WordPress solutions.",
  alternates: { canonical: "/" },
};

const SERVICE_ICONS = [Palette, Database, Globe, Users] as const;

const STATS = [
  { value: "12+", label: "Years Experience" },
  { value: "64+", label: "Projects Delivered" },
  { value: "100%", label: "Upwork Job Success" },
  { value: "8+", label: "Years with Zoom" },
];

const STEP_STATUS = {
  done: { label: "✓ Done", tone: "text-white/30" },
  active: { label: "In Progress", tone: "text-sc-accent-bright" },
  queued: { label: "Queued", tone: "text-white/20" },
} satisfies Record<string, { label: string; tone: string }>;

const BUILD_STEPS: { label: string; status: keyof typeof STEP_STATUS }[] = [
  { label: "Discovery & scope", status: "done" },
  { label: "UX design in Figma", status: "done" },
  { label: "Design approval", status: "done" },
  { label: "Content & assets", status: "done" },
  { label: "Build & integrate", status: "active" },
  { label: "Staging preview", status: "queued" },
  { label: "QA, tests & accessibility", status: "queued" },
  { label: "Performance & SEO audit", status: "queued" },
  { label: "Deploy & handover", status: "queued" },
];

const CORE_SERVICES = SERVICES.filter(
  (service) => service.slug !== "agency-partnerships",
);
const AGENCY_SERVICE = SERVICES.find(
  (service) => service.slug === "agency-partnerships",
);

export default async function HomePage() {
  const [dbProjects, dbReviews] = await Promise.all([
    getPublicProjectsSafe(),
    getApprovedReviewsSafe(),
  ]);

  const featuredWork = (dbProjects ?? PROJECTS).slice(0, 3);
  const testimonials = dbReviews
    ? dbReviews.map((review) => ({
        quote: review.quote,
        project: review.projectTitle ?? review.authorName,
        period:
          review.period ?? new Date(review.createdAt).getFullYear().toString(),
        rating: review.rating,
        source: normalizeReviewSource(review.source),
      }))
    : TESTIMONIALS;

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#15130f]/10">
        <div className="mx-auto max-w-[1400px] px-6 py-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div
                className={cn(
                  appChip,
                  "site-hero-in site-hero-in-delay-1 inline-flex items-center gap-2.5 px-3.5 py-2",
                )}
              >
                <span
                  aria-hidden
                  className="bg-sc-accent-bright size-1.5 rounded-full"
                />
                <p className="text-sc-accent text-[10px] font-bold tracking-[0.22em] uppercase">
                  Web Development Agency
                </p>
              </div>

              <h1 className="site-hero-in site-hero-in-delay-2 mt-7 max-w-[26ch] text-[clamp(2.1rem,4vw,3.35rem)] leading-[1.06] font-black tracking-[-0.03em] uppercase">
                We build high-performance{" "}
                <span className="text-sc-accent-bright">web solutions</span>{" "}
                that drive results
              </h1>

              <p className="site-hero-in site-hero-in-delay-3 mt-6 max-w-[34rem] text-[16px] leading-[1.7] text-[#57524a]">
                A full-service digital agency specializing in UX design, custom
                Next.js applications, WordPress solutions and scalable web
                platforms.
              </p>

              <div className="site-hero-in site-hero-in-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link href="#contact" className={appPrimaryButtonMarketing}>
                  Start Your Project <ArrowRight className="size-4" />
                </Link>
                <Link href="/work" className={cn("gap-2", appOutlineButton)}>
                  View Our Work
                </Link>
              </div>

              <p className="border-sc-accent-bright text-sc-muted mt-9 border-l-2 pl-4 text-[11px] leading-relaxed font-bold tracking-[0.14em] uppercase">
                From first contact to production deploy
              </p>
            </div>

            <div className="site-hero-in site-hero-in-delay-2 site-motion-lift relative overflow-hidden rounded-lg bg-[#15130f] p-7 text-white shadow-[0_8px_32px_rgba(21,19,15,0.18)] lg:p-9">
              <div
                aria-hidden
                className="bg-sc-accent-bright/25 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="bg-sc-accent-bright px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
                    Since 2016
                  </span>
                </div>

                <p className="mt-8 max-w-[24ch] text-[17px] leading-snug font-black tracking-tight text-white uppercase lg:text-[19px]">
                  Clean code and business outcomes — not generic templates.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-8">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-sc-accent-bright text-[34px] leading-none font-black tracking-[-0.02em] lg:text-[40px]">
                        {stat.value}
                      </p>
                      <p className="mt-2.5 text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="bg-sc-section border-b border-[#15130f]/10 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="site-reveal mb-16 max-w-2xl">
            <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
              Our Services
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              What We Do Best
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
              From product design and prototyping to full-stack builds, we
              deliver comprehensive digital services tailored to your business
              needs.
            </p>
          </div>

          <div className="site-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index] ?? Palette;
              return (
                <div
                  key={service.slug}
                  className={cn(
                    appPanelMuted,
                    appPanelHover,
                    "site-reveal site-motion-lift group site-card-hover-accent p-8",
                  )}
                >
                  <div className="group-hover:bg-sc-accent-bright mb-6 flex size-14 items-center justify-center bg-[#15130f] text-white transition-colors group-hover:text-[#15130f]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight uppercase">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
                    {service.summary}
                  </p>
                  <ul className="mt-5 space-y-1.5 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase">
                    {service.tools.map((tool) => (
                      <li key={tool.label}>
                        {tool.href ? (
                          <a
                            href={tool.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:text-sc-accent underline-offset-2 transition-colors hover:underline"
                          >
                            {tool.label}
                          </a>
                        ) : (
                          <span>{tool.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services#${service.slug}`}
                    className="hover:text-sc-accent mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase underline underline-offset-4 transition-colors"
                  >
                    Learn more <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          {AGENCY_SERVICE ? (
            <div className="site-reveal site-motion-lift mt-6 flex flex-col gap-6 rounded-lg bg-[#15130f] p-8 text-white shadow-[0_8px_32px_rgba(21,19,15,0.2)] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="bg-sc-accent-bright flex size-12 shrink-0 items-center justify-center text-[#15130f]">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-sc-accent-bright text-[10px] font-bold tracking-[0.2em] uppercase">
                    For agencies
                  </p>
                  <h3 className="mt-2 text-lg font-black tracking-tight uppercase">
                    {AGENCY_SERVICE.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/70">
                    {AGENCY_SERVICE.summary}
                  </p>
                </div>
              </div>
              <Link
                href={`/services#${AGENCY_SERVICE.slug}`}
                className="hover:border-sc-accent-bright hover:text-sc-accent-bright inline-flex shrink-0 items-center gap-2 self-start border-b-2 border-white/30 pb-1 text-[10px] font-bold tracking-[0.16em] uppercase transition-colors lg:self-auto"
              >
                Explore partnership <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* OUR WORK */}
      <section
        id="our-work"
        className="border-b border-[#15130f]/10 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="site-reveal mb-16 max-w-2xl">
            <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
              Our Work
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              Featured Projects
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
              A selection of our recent work showcasing the quality and
              diversity of solutions we deliver.
            </p>
          </div>

          {featuredWork.length > 0 ? (
            <>
              <div className="site-stagger grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {featuredWork.map((project) => (
                  <WorkCard key={project.slug} project={project} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/work"
                  className="hover:bg-sc-accent inline-flex items-center gap-2 rounded-md bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors"
                >
                  See All Our Work <ArrowRight className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <p
              className={cn(
                appEmptyState,
                "bg-white/60 px-6 py-16 text-center text-[15px] text-[#57524a]",
              )}
            >
              New case studies are on the way.
            </p>
          )}
        </div>
      </section>

      {/* CLIENT PROOF / REVIEWS */}
      <ClientProof testimonials={testimonials} fillLast={!dbReviews} />

      {/* WHY CHOOSE US */}
      <section className="border-b border-[#15130f]/10 py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="site-reveal">
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                Why Choose Us
              </p>
              <h2 className="mt-5 text-[clamp(1.85rem,4.1vw,3.05rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase">
                Built For Performance,
                <br />
                Designed For Growth
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                We don&apos;t just build websites—we create digital solutions
                that perform. With direct communication to developers, proven
                processes, and a focus on clean code, we deliver results that
                last.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Ruler className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">
                      Pixel-Perfect From Design
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Your designs built exactly as drawn. No drift, no
                      surprises — exact fidelity has been our specialty since
                      day one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">
                      Clean, Scalable Code
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Built with best practices and modern technologies for
                      long-term maintainability and growth.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">
                      Direct Communication
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Talk directly to the developers building your project. No
                      middlemen, no miscommunication.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/about#team"
                className="hover:text-sc-accent mt-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors"
              >
                Meet the team behind the work{" "}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="site-reveal site-motion-lift relative flex min-h-[360px] flex-col overflow-hidden rounded-lg bg-[#15130f] text-white shadow-[0_8px_32px_rgba(21,19,15,0.2)] ring-1 ring-white/10 sm:min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                </div>
                <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/45 uppercase">
                  <span className="bg-sc-accent-bright size-1.5 animate-pulse rounded-full" />
                  Build In Progress
                </p>
              </div>

              <div className="relative flex-1 overflow-hidden p-5 font-mono text-[12px] leading-relaxed sm:p-6 sm:text-[13px]">
                <div className="sc-scan pointer-events-none absolute inset-x-0 top-0 h-24" />
                <ul className="space-y-2.5">
                  {BUILD_STEPS.map((step) => {
                    const status = STEP_STATUS[step.status];
                    return (
                      <li key={step.label} className="flex items-center gap-3">
                        <span className="shrink-0 text-white/30">$</span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 break-words",
                            step.status === "queued"
                              ? "text-white/40"
                              : "text-white",
                          )}
                        >
                          {step.label}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[10px] font-bold tracking-[0.14em] uppercase",
                            status.tone,
                          )}
                        >
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-center gap-3">
                  <span className="shrink-0 text-white/30">$</span>
                  <span className="bg-sc-accent-bright inline-block h-4 w-2 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-sc-section scroll-mt-20 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
            <div className="site-reveal">
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                Contact Us
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                Let&apos;s Talk About
                <br />
                Your Project
              </h2>
              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#57524a]">
                Ready to start your next web project? Tell us about your goals
                and we&apos;ll get back to you with a plan to bring your ideas
                to life.
              </p>
              <Link
                href="/faq"
                className="hover:text-sc-accent mt-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors"
              >
                Questions about scope, timeline or pricing? Read the FAQ
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="site-reveal">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
