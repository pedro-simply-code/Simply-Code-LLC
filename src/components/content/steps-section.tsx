import type { StepsSectionData } from "~/lib/site-page-sections";
import {
  appSectionBand,
  appSectionContainer,
  siteReveal,
  siteStagger,
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

export function StepsSection({ data }: { data: StepsSectionData }) {
  return (
    <section
      className={cn(
        appSectionBand,
        "border-b border-[#15130f]/10 py-16 lg:py-24",
        data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
      )}
    >
      <div className={appSectionContainer}>
        <div className={cn(siteReveal, "mb-14 max-w-2xl")}>
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            {data.eyebrow}
          </p>
          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
            {renderMultiline(data.headline)}
          </h2>
        </div>

        <ol
          className={cn(
            siteStagger,
            "grid gap-6 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {data.steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(siteReveal, "border-t-2 border-[#15130f] pt-5")}
            >
              <span className="text-sc-accent text-[11px] font-bold tracking-[0.2em]">
                0{index + 1}
              </span>
              <h3 className="mt-2 text-base font-black tracking-tight uppercase">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#57524a]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
