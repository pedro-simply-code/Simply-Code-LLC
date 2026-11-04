"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ContactSection } from "~/components/content/contact-section";
import { CtaMarketingSection } from "~/components/content/cta-marketing-section";
import { FeatureGridSection } from "~/components/content/feature-grid-section";
import { HeroSection } from "~/components/content/hero-section";
import { PageHeaderSection } from "~/components/content/page-header-section";
import { PageIntroSection } from "~/components/content/page-intro-section";
import { ReviewsSection } from "~/components/content/reviews-section";
import { ServicesSection } from "~/components/content/services-section";
import { StepsSection } from "~/components/content/steps-section";
import { TeamSection } from "~/components/content/team-section";
import { WhySection } from "~/components/content/why-section";
import { WorkSection } from "~/components/content/work-section";
import type { Project } from "~/content/projects";
import { TEAM } from "~/content/team";
import { useContentEditorProjects } from "~/components/lexical/content-editor-projects-context";
import type { InsertContentBlockId } from "~/components/lexical/insert-content-block";
import {
  DEFAULT_CONTACT_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_FEATURE_GRID_SECTION,
  DEFAULT_HERO,
  DEFAULT_PAGE_HEADER_SECTION,
  DEFAULT_PAGE_INTRO_SECTION,
  DEFAULT_PROJECTS_SECTION,
  DEFAULT_REVIEWS_SECTION,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_STEPS_SECTION,
  DEFAULT_TEAM_SECTION,
  DEFAULT_WHY_SECTION,
  DEFAULT_WORK_SECTION,
} from "~/lib/content";
import { appQuoteInner, appQuoteOuter } from "~/lib/surface";
import { cn } from "~/lib/utils";

const PREVIEW_CANVAS_WIDTH = 960;
const PREVIEW_VIEWPORT_HEIGHT = 112;

function ScaledPreviewFrame({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / PREVIEW_CANVAS_WIDTH);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Previews are portaled into <body>, so they would otherwise inherit the
  // app theme foreground (near-white in dark mode) on a white canvas. The site
  // ink token is theme-independent, so pin the text color at the frame.
  return (
    <div
      ref={hostRef}
      className="text-sc-ink relative mt-2 w-full overflow-hidden rounded-md border border-[#15130f]/10 bg-white shadow-[inset_0_0_0_1px_rgba(21,19,15,0.04)]"
      style={{ height: PREVIEW_VIEWPORT_HEIGHT }}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 origin-top-left"
        style={{
          width: PREVIEW_CANVAS_WIDTH,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TextBlockPreview({ blockId }: { blockId: InsertContentBlockId }) {
  if (blockId === "h1") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.8rem)] font-black tracking-[-0.03em] uppercase">
            Page title
          </h1>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "h2") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h2 className="text-[clamp(1.6rem,3vw,2.3rem)] font-black tracking-[-0.03em] uppercase">
            Section heading
          </h2>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "h3") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h3 className="text-[1.35rem] font-black tracking-[-0.02em]">
            Subheading
          </h3>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "quote") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-6">
          <blockquote
            className={cn(appQuoteOuter, appQuoteInner, "not-italic")}
          >
            A pull quote that highlights an important idea from the page.
          </blockquote>
        </div>
      </ScaledPreviewFrame>
    );
  }
  return (
    <ScaledPreviewFrame>
      <div className="bg-sc-section px-10 py-6">
        <p className="text-[16px] leading-[1.8] text-[#3f3b34]">
          Body copy for a paragraph block. Use this for long-form content
          between sections.
        </p>
      </div>
    </ScaledPreviewFrame>
  );
}

function SectionPreview({
  blockId,
  catalogProjects,
}: {
  blockId: InsertContentBlockId;
  catalogProjects: Project[];
}) {
  switch (blockId) {
    case "hero":
      return <HeroSection data={DEFAULT_HERO} />;
    case "services":
      return <ServicesSection data={DEFAULT_SERVICES_SECTION} />;
    case "work":
      return (
        <WorkSection
          data={DEFAULT_WORK_SECTION}
          projects={catalogProjects.slice(0, DEFAULT_WORK_SECTION.projectCount)}
        />
      );
    case "projects":
      return (
        <WorkSection
          data={{ ...DEFAULT_PROJECTS_SECTION, showTagFilter: false }}
          projects={catalogProjects}
        />
      );
    case "reviews":
      return <ReviewsSection data={DEFAULT_REVIEWS_SECTION} />;
    case "why":
      return <WhySection data={DEFAULT_WHY_SECTION} />;
    case "contact":
      return <ContactSection data={DEFAULT_CONTACT_SECTION} />;
    case "cta":
      return <CtaMarketingSection data={DEFAULT_CTA_SECTION} />;
    case "page-header":
      return <PageHeaderSection data={DEFAULT_PAGE_HEADER_SECTION} />;
    case "page-intro":
      return <PageIntroSection data={DEFAULT_PAGE_INTRO_SECTION} />;
    case "feature-grid":
      return <FeatureGridSection data={DEFAULT_FEATURE_GRID_SECTION} />;
    case "steps":
      return <StepsSection data={DEFAULT_STEPS_SECTION} />;
    case "team":
      return (
        <TeamSection
          data={DEFAULT_TEAM_SECTION}
          members={TEAM.slice(0, 3)}
          teamFromStudio={false}
        />
      );
    default:
      return null;
  }
}

export function ContentBlockPreview({
  blockId,
}: {
  blockId: InsertContentBlockId;
}) {
  const catalogProjects = useContentEditorProjects();

  if (
    blockId === "paragraph" ||
    blockId === "h1" ||
    blockId === "h2" ||
    blockId === "h3" ||
    blockId === "quote"
  ) {
    return <TextBlockPreview blockId={blockId} />;
  }

  return (
    <ScaledPreviewFrame>
      <SectionPreview blockId={blockId} catalogProjects={catalogProjects} />
    </ScaledPreviewFrame>
  );
}
