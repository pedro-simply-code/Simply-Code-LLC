import type { ComponentType } from "react";
import { Code2, MessageSquare, Palette, Ruler } from "lucide-react";
import type {
  FeatureGridIcon,
  FeatureGridSectionData,
} from "~/lib/site-page-sections";
import {
  appPanelMuted,
  appSectionBand,
  appSectionContainer,
  siteMotionLift,
  siteReveal,
  siteStagger,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

const ICONS: Record<FeatureGridIcon, ComponentType<{ className?: string }>> = {
  ruler: Ruler,
  code: Code2,
  message: MessageSquare,
  palette: Palette,
};

export function featureGridIcon(
  icon: FeatureGridIcon,
): ComponentType<{ className?: string }> {
  return ICONS[icon] ?? Ruler;
}

function renderMultiline(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

export function FeatureGridSection({
  data,
  hideHeader = false,
  gridOnly = false,
}: {
  data: FeatureGridSectionData;
  hideHeader?: boolean;
  gridOnly?: boolean;
}) {
  const grid = (
    <div className={cn(siteStagger, "grid gap-6 lg:grid-cols-3")}>
      {data.features.map((feature) => {
        const Icon = featureGridIcon(feature.icon);
        return (
          <div
            key={feature.title}
            className={cn(appPanelMuted, siteReveal, siteMotionLift, "p-8")}
          >
            <span className="flex size-12 items-center justify-center bg-[#15130f] text-white">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-6 text-lg font-black tracking-tight uppercase">
              {feature.title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
              {feature.body}
            </p>
          </div>
        );
      })}
    </div>
  );

  if (gridOnly) return grid;

  return (
    <section
      className={cn(
        appSectionBand,
        "border-b border-[#15130f]/10 py-16 lg:py-24",
        data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
      )}
    >
      <div className={appSectionContainer}>
        {hideHeader ? null : (
          <div className={cn(siteReveal, "mb-14 max-w-2xl")}>
            <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
              {data.eyebrow}
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              {renderMultiline(data.headline)}
            </h2>
          </div>
        )}

        {grid}
      </div>
    </section>
  );
}
