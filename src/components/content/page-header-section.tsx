import type { PageHeaderSectionData } from "~/lib/site-page-sections";
import { appSectionBand, appSectionContainer } from "~/lib/surface";
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
        <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
          {data.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
          {renderMultiline(data.headline)}
        </h1>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
          {data.description}
        </p>
      </div>
    </section>
  );
}
