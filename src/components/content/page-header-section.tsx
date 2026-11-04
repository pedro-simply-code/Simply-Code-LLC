import Link from "next/link";
import type { PageHeaderSectionData } from "~/lib/site-page-sections";
import { appChip, appSectionBand, appSectionContainer } from "~/lib/surface";
import { isExternalHref } from "~/lib/link-options";
import { cn } from "~/lib/utils";

function renderMultiline(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <span key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

const tagClassName = cn(
  appChip,
  "px-4 py-2 text-[11px] tracking-[0.12em] transition-colors hover:bg-[#15130f] hover:text-white hover:shadow-[0_2px_10px_rgba(21,19,15,0.15)]",
);

export function PageHeaderSection({ data }: { data: PageHeaderSectionData }) {
  return (
    <section
      className={cn(
        appSectionBand,
        "border-b border-[#15130f]/10 py-16 lg:py-24",
        data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
      )}
    >
      <div className={appSectionContainer}>
        <p className="site-hero-in site-hero-in-delay-1 text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
          {data.eyebrow}
        </p>
        <h1 className="site-hero-in site-hero-in-delay-2 mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
          {renderMultiline(data.headline)}
        </h1>
        <p className="site-hero-in site-hero-in-delay-3 mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
          {data.description}
        </p>

        {data.tags.length > 0 ? (
          <nav
            aria-label={`${data.eyebrow || "Page"} links`}
            className="site-hero-in site-hero-in-delay-3 mt-10 flex flex-wrap gap-2"
          >
            {data.tags.map((tag, index) => {
              if (isExternalHref(tag.href)) {
                return (
                  <a
                    key={`${tag.href}-${index}`}
                    href={tag.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={tagClassName}
                  >
                    {tag.label}
                  </a>
                );
              }
              return (
                <Link
                  key={`${tag.href}-${index}`}
                  href={tag.href || "#"}
                  className={tagClassName}
                >
                  {tag.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
