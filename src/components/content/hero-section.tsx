import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { HeroData } from "~/lib/content";
import { heroButtonsInDisplayOrder } from "~/lib/content";
import { buildLinkRel, isExternalHref } from "~/lib/link-options";
import {
  appChip,
  appHeroBand,
  appHeroContainer,
  appOutlineButton,
  appPrimaryButtonMarketing,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function Headline({
  headline,
  highlight,
}: {
  headline: string;
  highlight: string;
}) {
  const accent = highlight.trim();
  const index = accent ? headline.indexOf(accent) : -1;

  if (index === -1) return <>{headline}</>;

  return (
    <>
      {headline.slice(0, index)}
      <span className="text-sc-accent-bright">{accent}</span>
      {headline.slice(index + accent.length)}
    </>
  );
}

function HeroAction({
  href,
  newTab,
  nofollow,
  className,
  children,
}: {
  href: string;
  newTab: boolean;
  nofollow: boolean;
  className?: string;
  children: ReactNode;
}) {
  const url = href.trim() || "#";
  const rel = buildLinkRel({ newTab, nofollow }) ?? undefined;
  const external = isExternalHref(url);

  if (external) {
    return (
      <a
        href={url}
        className={className}
        rel={rel}
        target={newTab ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  }

  if (newTab) {
    return (
      <Link href={url} className={className} rel={rel} target="_blank">
        {children}
      </Link>
    );
  }

  return (
    <Link href={url} className={className} rel={nofollow ? "nofollow" : undefined}>
      {children}
    </Link>
  );
}

/**
 * The homepage hero, extracted so both the public renderer and the Lexical
 * editor preview share exactly one implementation.
 */
export function HeroSection({
  data,
  className,
}: {
  data: HeroData;
  className?: string;
}) {
  const stats = data.stats.filter(
    (stat) => stat.value.trim() || stat.label.trim(),
  );
  const buttonOrder = heroButtonsInDisplayOrder(data);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-[#15130f]/10",
        appHeroBand,
        className,
      )}
    >
      <div className={cn(appHeroContainer, "px-6 py-14 lg:py-20")}>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            {data.eyebrow ? (
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
                  {data.eyebrow}
                </p>
              </div>
            ) : null}

            <h1 className="site-hero-in site-hero-in-delay-2 mt-7 max-w-[26ch] text-[clamp(2.1rem,4vw,3.35rem)] leading-[1.06] font-black tracking-[-0.03em] uppercase">
              <Headline headline={data.headline} highlight={data.highlight} />
            </h1>

            {data.description ? (
              <p className="site-hero-in site-hero-in-delay-3 mt-6 max-w-[34rem] text-[16px] leading-[1.7] text-[#57524a]">
                {data.description}
              </p>
            ) : null}

            {buttonOrder.length > 0 ? (
              <div className="site-hero-in site-hero-in-delay-3 mt-8 flex flex-wrap items-center gap-3">
                {buttonOrder.map((slot) =>
                  slot === "primary" ? (
                    <HeroAction
                      key="primary"
                      href={data.primaryHref}
                      newTab={data.primaryNewTab}
                      nofollow={data.primaryNofollow}
                      className={appPrimaryButtonMarketing}
                    >
                      {data.primaryLabel} <ArrowRight className="size-4" />
                    </HeroAction>
                  ) : (
                    <HeroAction
                      key="secondary"
                      href={data.secondaryHref}
                      newTab={data.secondaryNewTab}
                      nofollow={data.secondaryNofollow}
                      className={cn("gap-2", appOutlineButton)}
                    >
                      {data.secondaryLabel}
                    </HeroAction>
                  ),
                )}
              </div>
            ) : null}

            {data.tagline ? (
              <p className="border-sc-accent-bright text-sc-muted mt-9 border-l-2 pl-4 text-[11px] leading-relaxed font-bold tracking-[0.14em] uppercase">
                {data.tagline}
              </p>
            ) : null}
          </div>

          <div className="site-hero-in site-hero-in-delay-2 site-motion-lift relative overflow-hidden rounded-lg bg-[#15130f] p-7 text-white shadow-[0_8px_32px_rgba(21,19,15,0.18)] lg:p-9">
            <div
              aria-hidden
              className="bg-sc-accent-bright/25 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="bg-sc-accent-bright px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
                  {data.badge || "Simply Code"}
                </span>
              </div>

              {data.panelText ? (
                <p className="mt-8 max-w-[24ch] text-[17px] leading-snug font-black tracking-tight text-white uppercase lg:text-[19px]">
                  {data.panelText}
                </p>
              ) : null}

              {stats.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-8">
                  {stats.map((stat, index) => (
                    <div key={`${stat.label}-${index}`}>
                      <p className="text-sc-accent-bright text-[34px] leading-none font-black tracking-[-0.02em] lg:text-[40px]">
                        {stat.value}
                      </p>
                      <p className="mt-2.5 text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
