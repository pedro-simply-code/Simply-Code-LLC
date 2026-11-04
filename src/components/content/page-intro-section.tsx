import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export function PageIntroSection({ data }: { data: PageIntroSectionData }) {
  return (
    <section
      className={cn(
        appSectionBand,
        "border-b border-[#15130f]/10 py-16 lg:py-24 bg-sc-section-alt",
      )}
    >
      <div
        className={cn(
          appSectionContainer,
          "grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20",
        )}
      >
        <div>
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            {data.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,5.6vw,4.6rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
            {renderMultiline(data.headline)}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#57524a]">
            {data.body}
          </p>
          {data.bodySecondary ? (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#57524a]">
              {data.bodySecondary}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={data.primaryHref} className={appPrimaryButtonMarketing}>
              {data.primaryLabel} <ArrowRight className="size-4" />
            </Link>
            {data.showSecondary ? (
              <Link href={data.secondaryHref} className={cn("gap-2", appOutlineButton)}>
                {data.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className={cn(appPanel, "p-8 lg:p-10")}>
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.22em] uppercase">
            {data.panelEyebrow}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
            {data.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[10px] font-bold tracking-[0.16em] text-[#6f6a60] uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[34px] leading-none font-black tracking-[-0.02em] text-[#15130f]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          {data.panelFooter ? (
            <div className="mt-8 border-t border-[#15130f]/10 pt-6 text-[13px] text-[#57524a]">
              {data.panelFooter}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
