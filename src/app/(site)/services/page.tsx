import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Handshake,
  Palette,
  PenTool,
} from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { ENGAGEMENT_MODELS, SERVICES } from "~/content/services";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";
import {
  appAccentBrightButtonMarketingSm,
  appChip,
  appGhostButton,
  appPanel,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "UX and product design, full-stack Next.js platforms, custom WordPress development and white-label agency partnerships.",
  path: "/services",
});

const SERVICE_ICONS = {
  "ux-design": Palette,
  "full-stack": Code2,
  "wordpress-development": PenTool,
  "agency-partnerships": Handshake,
} as const;

export default function ServicesPage() {
  return (
    <>
      <SiteNav />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-6">
            <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
              Services
            </p>
            <h1 className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
              Design, Build
              <br />
              And Everything Between
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
              We are a small, senior team. The people who scope your project are
              the people who design and build it — from the first flow to the
              final deploy.
            </p>

            <nav aria-label="Services" className="mt-10 flex flex-wrap gap-2">
              {SERVICES.map((service) => (
                <a
                  key={service.slug}
                  href={`#${service.slug}`}
                  className={cn(
                    appChip,
                    "px-4 py-2 text-[11px] tracking-[0.12em] transition-colors hover:bg-[#15130f] hover:text-white hover:shadow-[0_2px_10px_rgba(21,19,15,0.15)]",
                  )}
                >
                  {service.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {SERVICES.map((service, index) => {
          const Icon =
            SERVICE_ICONS[service.slug as keyof typeof SERVICE_ICONS] ??
            Palette;

          return (
            <section
              key={service.slug}
              id={service.slug}
              className={`scroll-mt-24 border-b border-[#15130f]/10 py-16 lg:py-24 ${
                index % 2 === 0 ? "bg-white" : "bg-sc-section-alt"
              }`}
            >
              <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-sc-accent-bright flex size-12 items-center justify-center bg-[#15130f]">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-[11px] font-bold tracking-[0.22em] text-[#6f6a60] uppercase">
                      0{index + 1} / Service
                    </span>
                  </div>

                  <h2 className="mt-6 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                    {service.title}
                  </h2>
                  <p className="mt-5 text-[16px] leading-relaxed text-[#57524a]">
                    {service.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {service.tools.map((tool) =>
                      tool.href ? (
                        <a
                          key={tool.label}
                          href={tool.href}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            appGhostButton,
                            "hover:text-sc-accent transition-colors",
                          )}
                        >
                          {tool.label}
                        </a>
                      ) : (
                        <span key={tool.label} className={appGhostButton}>
                          {tool.label}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className={cn(appPanel, "p-8")}>
                  <p className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase">
                    What you get
                  </p>
                  <ul className="mt-5 space-y-3.5">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="text-sc-accent mt-0.5 size-4 shrink-0" />
                        <span className="text-[15px] leading-relaxed text-[#57524a]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className="hover:bg-sc-accent mt-8 inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors"
                  >
                    Discuss this service <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="bg-[#15130f] py-16 text-white lg:py-24">
          <div className="mx-auto max-w-[1400px] px-6">
            <p className="text-sc-accent-bright text-[11px] font-bold tracking-[0.24em] uppercase">
              How We Work
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              Three Ways To Work Together
            </h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/60">
              No hourly surprises and no open-ended scopes. Pick the model that
              matches how your team already works.
            </p>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {ENGAGEMENT_MODELS.map((model, index) => (
                <div
                  key={model.title}
                  className="flex flex-col rounded-lg bg-white/[0.03] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.2)] ring-1 ring-white/10"
                >
                  <span className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-black tracking-tight uppercase">
                    {model.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[14px] leading-relaxed text-white/60">
                    {model.description}
                  </p>
                  <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/45">
                    <span className="font-bold tracking-[0.12em] text-white/70 uppercase">
                      Best for:
                    </span>{" "}
                    {model.bestFor}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Link
                href="/contact"
                className={appAccentBrightButtonMarketingSm}
              >
                Request a quote <ArrowRight className="size-4" />
              </Link>
              <a
                href={`mailto:${SITE.email}`}
                className="hover:text-sc-accent-bright text-[14px] font-semibold text-white/70 underline underline-offset-8 transition-colors"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </section>

        <CtaSection />
      </main>

      <SiteFooter />
    </>
  );
}
