/**
 * Insert Lexical decorator blocks and prose blocks from the block inserter.
 */
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode, $getRoot, type LexicalEditor } from "lexical";
import { $createHeroNode } from "~/components/lexical/hero-node";
import { $createServicesSectionNode } from "~/components/lexical/services-node";
import { $createWorkSectionNode } from "~/components/lexical/work-node";
import { $createReviewsSectionNode } from "~/components/lexical/reviews-node";
import { $createWhySectionNode } from "~/components/lexical/why-node";
import { $createContactSectionNode } from "~/components/lexical/contact-node";
import { $createCtaSectionNode } from "~/components/lexical/cta-node";
import { $createPageHeaderSectionNode } from "~/components/lexical/page-header-node";
import { $createPageIntroSectionNode } from "~/components/lexical/page-intro-node";
import { $createFeatureGridSectionNode } from "~/components/lexical/feature-grid-node";
import { $createStepsSectionNode } from "~/components/lexical/steps-node";
import { $createTeamSectionNode } from "~/components/lexical/team-node";
import {
  $createServiceOfferingsSectionNode,
  $isServiceOfferingsSectionNode,
} from "~/components/lexical/service-offerings-node";
import { $createEngagementModelsSectionNode } from "~/components/lexical/engagement-models-node";
import { $createBlogSectionNode } from "~/components/lexical/blog-node";
import { $createFaqSectionNode } from "~/components/lexical/faq-node";
import { $createLegalDocumentSectionNode } from "~/components/lexical/legal-document-node";
import {
  $insertDecoratorBlock,
  $insertProseBlock,
} from "~/components/lexical/insert-decorator-block";
import {
  createServiceOfferingsSectionData,
  DEFAULT_BLOG_SECTION,
  DEFAULT_FAQ_SECTION,
  DEFAULT_PRIVACY_DOCUMENT_SECTION,
  DEFAULT_TERMS_DOCUMENT_SECTION,
  DEFAULT_CONTACT_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_ENGAGEMENT_MODELS_SECTION,
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

export type InsertContentBlockId =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "hero"
  | "services"
  | "work"
  | "projects"
  | "reviews"
  | "why"
  | "contact"
  | "cta"
  | "page-header"
  | "page-intro"
  | "feature-grid"
  | "steps"
  | "team"
  | "service-offerings"
  | "engagement-models"
  | "blog"
  | "faq"
  | "legal-document";

export function insertContentBlock(
  editor: LexicalEditor,
  value: InsertContentBlockId,
) {
  editor.update(
    () => {
      if (value === "hero") {
        $insertDecoratorBlock(() => $createHeroNode(DEFAULT_HERO));
        return;
      }
      if (value === "services") {
        $insertDecoratorBlock(() =>
          $createServicesSectionNode(DEFAULT_SERVICES_SECTION),
        );
        return;
      }
      if (value === "work") {
        $insertDecoratorBlock(() =>
          $createWorkSectionNode(DEFAULT_WORK_SECTION),
        );
        return;
      }
      if (value === "projects") {
        $insertDecoratorBlock(() =>
          $createWorkSectionNode(DEFAULT_PROJECTS_SECTION),
        );
        return;
      }
      if (value === "reviews") {
        $insertDecoratorBlock(() =>
          $createReviewsSectionNode(DEFAULT_REVIEWS_SECTION),
        );
        return;
      }
      if (value === "why") {
        $insertDecoratorBlock(() => $createWhySectionNode(DEFAULT_WHY_SECTION));
        return;
      }
      if (value === "contact") {
        $insertDecoratorBlock(() =>
          $createContactSectionNode(DEFAULT_CONTACT_SECTION),
        );
        return;
      }
      if (value === "cta") {
        $insertDecoratorBlock(() => $createCtaSectionNode(DEFAULT_CTA_SECTION));
        return;
      }
      if (value === "page-header") {
        $insertDecoratorBlock(() =>
          $createPageHeaderSectionNode(DEFAULT_PAGE_HEADER_SECTION),
        );
        return;
      }
      if (value === "page-intro") {
        $insertDecoratorBlock(() =>
          $createPageIntroSectionNode(DEFAULT_PAGE_INTRO_SECTION),
        );
        return;
      }
      if (value === "feature-grid") {
        $insertDecoratorBlock(() =>
          $createFeatureGridSectionNode(DEFAULT_FEATURE_GRID_SECTION),
        );
        return;
      }
      if (value === "steps") {
        $insertDecoratorBlock(() =>
          $createStepsSectionNode(DEFAULT_STEPS_SECTION),
        );
        return;
      }
      if (value === "team") {
        $insertDecoratorBlock(() =>
          $createTeamSectionNode(DEFAULT_TEAM_SECTION),
        );
        return;
      }
      if (value === "service-offerings") {
        const existing = $getRoot()
          .getChildren()
          .filter($isServiceOfferingsSectionNode);
        const usedNumbers = new Set(
          existing.map((node) => node.getData().service.number.trim()),
        );
        const usedSlugs = new Set(
          existing.map((node) => node.getData().service.slug.trim()),
        );

        let index = 1;
        let number = String(index).padStart(2, "0");
        while (usedNumbers.has(number)) {
          index += 1;
          number = String(index).padStart(2, "0");
        }

        let slug = `service-${number}`;
        let suffix = 2;
        while (usedSlugs.has(slug)) {
          slug = `service-${number}-${suffix}`;
          suffix += 1;
        }

        $insertDecoratorBlock(() =>
          $createServiceOfferingsSectionNode(
            createServiceOfferingsSectionData({
              service: { number, slug },
            }),
          ),
        );
        return;
      }
      if (value === "engagement-models") {
        $insertDecoratorBlock(() =>
          $createEngagementModelsSectionNode(DEFAULT_ENGAGEMENT_MODELS_SECTION),
        );
        return;
      }
      if (value === "blog") {
        $insertDecoratorBlock(() =>
          $createBlogSectionNode(DEFAULT_BLOG_SECTION),
        );
        return;
      }
      if (value === "faq") {
        $insertDecoratorBlock(() => $createFaqSectionNode(DEFAULT_FAQ_SECTION));
        return;
      }
      if (value === "legal-document") {
        $insertDecoratorBlock(() =>
          $createLegalDocumentSectionNode(DEFAULT_TERMS_DOCUMENT_SECTION),
        );
        return;
      }

      const node =
        value === "quote"
          ? $createQuoteNode()
          : value === "paragraph"
            ? $createParagraphNode()
            : $createHeadingNode(value);

      $insertProseBlock(() => node);
    },
    { onUpdate: () => editor.focus() },
  );
}
