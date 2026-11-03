import { CtaMarketingSection } from "~/components/content/cta-marketing-section";
import {
  DEFAULT_CTA_SECTION,
  normalizeCtaSectionData,
} from "~/lib/homepage-sections";

type CtaSectionProps = {
  title?: string;
  description?: string;
};

/** Static-site footer CTA (about, services, work, FAQ, blog index). */
export function CtaSection({ title, description }: CtaSectionProps) {
  const data = normalizeCtaSectionData({
    headline: title ?? DEFAULT_CTA_SECTION.headline,
    description: description ?? DEFAULT_CTA_SECTION.description,
  });

  return <CtaMarketingSection data={data} />;
}
