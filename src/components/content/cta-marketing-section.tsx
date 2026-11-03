import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { CtaSectionData } from "~/lib/homepage-sections";
import { isExternalHref } from "~/lib/link-options";
import {
  appCtaBand,
  appCtaContainer,
  appPrimaryButtonMarketingLg,
  siteReveal,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function CtaButton({
  href,
  newTab,
  className,
  children,
}: {
  href: string;
  newTab: boolean;
  className?: string;
  children: ReactNode;
}) {
  const url = href.trim() || "/contact";
  if (isExternalHref(url)) {
    return (
      <a
        href={url}
        className={className}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer noopener" : undefined}
      >
        {children}
      </a>
    );
  }
  if (newTab) {
    return (
      <Link href={url} className={className} target="_blank" rel="noreferrer">
        {children}
      </Link>
    );
  }
  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}

export function CtaMarketingSection({
  data,
  className,
  headlineOverride,
  descriptionOverride,
  actionsOverride,
}: {
  data: CtaSectionData;
  className?: string;
  headlineOverride?: ReactNode;
  descriptionOverride?: ReactNode;
  actionsOverride?: ReactNode;
}) {
  return (
    <section className={cn(appCtaBand, className)}>
      <div className={appCtaContainer}>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className={siteReveal}>
            {headlineOverride ?? (
              <h2 className="max-w-3xl text-[clamp(2rem,4.8vw,3.6rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                {data.headline}
              </h2>
            )}
            {descriptionOverride ?? (
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]">
                {data.description}
              </p>
            )}
          </div>

          {actionsOverride ?? (
            <div
              className={cn(
                siteReveal,
                "flex flex-col items-start gap-4 lg:items-end",
              )}
            >
              {data.buttonLabel.trim() ? (
                <CtaButton
                  href={data.buttonHref}
                  newTab={data.buttonNewTab}
                  className={appPrimaryButtonMarketingLg}
                >
                  {data.buttonLabel} <ArrowRight className="size-4" />
                </CtaButton>
              ) : null}
              {data.showEmail && data.email.trim() ? (
                <a
                  href={`mailto:${data.email.trim()}`}
                  className="hover:text-sc-accent text-[14px] font-semibold text-[#15130f] underline underline-offset-8 transition-colors"
                >
                  {data.email.trim()}
                </a>
              ) : null}
              {data.showResponseNote && data.responseNote.trim() ? (
                <p className="text-[12px] tracking-[0.12em] text-[#6f6a60] uppercase">
                  {data.responseNote}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
