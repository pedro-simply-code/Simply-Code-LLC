import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { buildLinkRel, isExternalHref } from "~/lib/link-options";
import type { PageIntroSectionData } from "~/lib/site-page-sections";
import {
  appOutlineButton,
  appPanel,
  appPrimaryButtonMarketing,
  appSectionBand,
  appSectionContainer,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function renderMultiline(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

function IntroLink({
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
  const target = newTab ? "_blank" : undefined;
  const rel = buildLinkRel({ newTab, nofollow }) ?? undefined;

  if (isExternalHref(url)) {
    return (
      <a href={url} target={target} rel={rel} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={url} target={target} rel={rel} className={className}>
      {children}
    </Link>
  );
}

export function PageIntroSection({
  data,
  contentOverride,
  panelOverride,
}: {
  data: PageIntroSectionData;
  /** Studio editor: editable left-hand copy. */
  contentOverride?: ReactNode;
  /** Studio editor: editable stats panel. */
  panelOverride?: ReactNode;
}) {
  const stats = data.stats.filter(
    (stat) => stat.value.trim() || stat.label.trim(),
  );
  const emailHref =
    data.panelEmailHref.trim() || `mailto:${data.panelEmail.trim()}`;

  return (
    <section
      className={cn(
        appSectionBand,
        "bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24",
      )}
    >
      <div
        className={cn(
          appSectionContainer,
          "grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20",
        )}
      >
        {contentOverride ?? (
          <div>
            <p className="site-hero-in site-hero-in-delay-1 text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
              {data.eyebrow}
            </p>
            <h1 className="site-hero-in site-hero-in-delay-2 mt-5 text-[clamp(2.5rem,5.6vw,4.6rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
              {renderMultiline(data.headline)}
            </h1>
            <p className="site-hero-in site-hero-in-delay-3 mt-6 max-w-2xl text-[17px] leading-relaxed text-[#57524a]">
              {data.body}
            </p>
            {data.bodySecondary ? (
              <p className="site-hero-in site-hero-in-delay-3 mt-4 max-w-2xl text-[15px] leading-relaxed text-[#57524a]">
                {data.bodySecondary}
              </p>
            ) : null}

            {data.primaryLabel.trim() ||
            (data.showSecondary && data.secondaryLabel.trim()) ? (
              <div className="site-hero-in site-hero-in-delay-3 mt-8 flex flex-wrap gap-3">
                {data.primaryLabel.trim() ? (
                  <IntroLink
                    href={data.primaryHref}
                    newTab={data.primaryNewTab}
                    nofollow={data.primaryNofollow}
                    className={appPrimaryButtonMarketing}
                  >
                    {data.primaryLabel} <ArrowRight className="size-4" />
                  </IntroLink>
                ) : null}
                {data.showSecondary && data.secondaryLabel.trim() ? (
                  <IntroLink
                    href={data.secondaryHref}
                    newTab={data.secondaryNewTab}
                    nofollow={data.secondaryNofollow}
                    className={cn("gap-2", appOutlineButton)}
                  >
                    {data.secondaryLabel}
                  </IntroLink>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {panelOverride ?? (
          <div
            className={cn(
              appPanel,
              "site-hero-in site-hero-in-delay-2 p-8 lg:p-10",
            )}
          >
            <p className="text-sc-accent text-[11px] font-bold tracking-[0.22em] uppercase">
              {data.panelEyebrow}
            </p>
            {stats.length > 0 ? (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {stats.map((stat, index) => (
                  <div key={`${stat.label}-${index}`}>
                    <dt className="text-[10px] font-bold tracking-[0.16em] text-[#6f6a60] uppercase">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-[34px] leading-none font-black tracking-[-0.02em] text-[#15130f]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {data.panelFooter || data.panelEmail.trim() ? (
              <div className="mt-8 space-y-1.5 border-t border-[#15130f]/10 pt-6 text-[13px] text-[#57524a]">
                {data.panelFooter ? <p>{data.panelFooter}</p> : null}
                {data.panelEmail.trim() ? (
                  <p>
                    <IntroLink
                      href={emailHref}
                      newTab={data.panelEmailNewTab}
                      nofollow={data.panelEmailNofollow}
                      className="hover:text-sc-accent"
                    >
                      {data.panelEmail}
                    </IntroLink>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
