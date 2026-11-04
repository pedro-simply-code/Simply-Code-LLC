/**
 * Insert Lexical decorator blocks and prose blocks from the block inserter.
 */
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  type LexicalEditor,
} from "lexical";
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
import { $insertDecoratorBlock, $insertProseBlock } from "~/components/lexical/insert-decorator-block";
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
  | "team";

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
        $insertDecoratorBlock(() => $createTeamSectionNode(DEFAULT_TEAM_SECTION));
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
