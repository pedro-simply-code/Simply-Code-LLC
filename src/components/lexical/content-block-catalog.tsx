import {
  Briefcase,
  Contact,
  FileText,
  HelpCircle,
  Grid3X3,
  Scale,
  Heading,
  Heading2,
  Heading3,
  LayoutGrid,
  Layers,
  ListOrdered,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  Quote,
  Sparkles,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { InsertContentBlockId } from "~/components/lexical/insert-content-block";

export type ContentBlockCategory = "sections" | "text";

export type ContentBlockDefinition = {
  id: InsertContentBlockId;
  label: string;
  description: string;
  category: ContentBlockCategory;
  icon: LucideIcon;
};

export const CONTENT_BLOCK_CATALOG: ContentBlockDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "Homepage hero with headline and CTAs",
    category: "sections",
    icon: Sparkles,
  },
  {
    id: "services",
    label: "Services",
    description: "Service cards grid",
    category: "sections",
    icon: Wrench,
  },
  {
    id: "service-offerings",
    label: "Service offering",
    description: "One detailed service with deliverables, tools and a button",
    category: "sections",
    icon: Layers,
  },
  {
    id: "engagement-models",
    label: "Engagement models",
    description: "Three ways to work together band",
    category: "sections",
    icon: Users,
  },
  {
    id: "work",
    label: "Featured work",
    description: "Short grid of highlighted projects",
    category: "sections",
    icon: Briefcase,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Full project listing with optional tag filter",
    category: "sections",
    icon: LayoutGrid,
  },
  {
    id: "blog",
    label: "Blog posts",
    description: "Paginated post grid (like Projects, without filters)",
    category: "sections",
    icon: Newspaper,
  },
  {
    id: "faq",
    label: "FAQ page",
    description: "Two-column FAQ with add/remove questions",
    category: "sections",
    icon: HelpCircle,
  },
  {
    id: "legal-document",
    label: "Legal document",
    description: "Terms, privacy or policy sections",
    category: "sections",
    icon: Scale,
  },
  {
    id: "reviews",
    label: "Client proof",
    description: "Reviews and testimonials",
    category: "sections",
    icon: Star,
  },
  {
    id: "why",
    label: "Why choose us",
    description: "Value props and differentiators",
    category: "sections",
    icon: Megaphone,
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact form section",
    category: "sections",
    icon: Contact,
  },
  {
    id: "cta",
    label: "Marketing CTA",
    description: "Call-to-action band",
    category: "sections",
    icon: MessageSquareQuote,
  },
  {
    id: "page-header",
    label: "Page header",
    description: "Title band for inner pages",
    category: "sections",
    icon: FileText,
  },
  {
    id: "page-intro",
    label: "Page intro",
    description: "Split intro with sidebar copy",
    category: "sections",
    icon: FileText,
  },
  {
    id: "feature-grid",
    label: "Feature grid",
    description: "Icon features in a grid",
    category: "sections",
    icon: Grid3X3,
  },
  {
    id: "steps",
    label: "Process steps",
    description: "Numbered steps timeline",
    category: "sections",
    icon: ListOrdered,
  },
  {
    id: "team",
    label: "Team",
    description: "Team member cards",
    category: "sections",
    icon: Users,
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Body text block",
    category: "text",
    icon: FileText,
  },
  {
    id: "h1",
    label: "Heading 1",
    description: "Page title or hero headline",
    category: "text",
    icon: Heading,
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Section heading",
    category: "text",
    icon: Heading2,
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Subheading",
    category: "text",
    icon: Heading3,
  },
  {
    id: "quote",
    label: "Quote",
    description: "Pull quote block",
    category: "text",
    icon: Quote,
  },
];

export const CONTENT_BLOCK_CATEGORIES: {
  id: ContentBlockCategory;
  label: string;
}[] = [
  { id: "sections", label: "Sections" },
  { id: "text", label: "Text" },
];
