/**
 * Site marketing page blocks (About, Services headers, etc.) — Lexical decorators.
 */

import { ENGAGEMENT_MODELS, SERVICES } from "~/content/services";
import { SITE } from "~/content/site";

export const PAGE_HEADER_SECTION_NODE_TYPE = "page-header-section";
export const PAGE_INTRO_SECTION_NODE_TYPE = "page-intro-section";
export const FEATURE_GRID_SECTION_NODE_TYPE = "feature-grid-section";
export const STEPS_SECTION_NODE_TYPE = "steps-section";
export const TEAM_SECTION_NODE_TYPE = "team-section";
export const SERVICE_OFFERINGS_SECTION_NODE_TYPE = "service-offerings-section";
export const ENGAGEMENT_MODELS_SECTION_NODE_TYPE = "engagement-models-section";

export const SITE_PAGE_BLOCK_NODE_TYPES = [
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  STEPS_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
  SERVICE_OFFERINGS_SECTION_NODE_TYPE,
  ENGAGEMENT_MODELS_SECTION_NODE_TYPE,
] as const;

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/* --- Page header (Services / Contact style) --- */

export type PageHeaderLink = { label: string; href: string };

export type PageHeaderSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  surface: "alt" | "default";
  /** Chips rendered under the description (e.g. service anchor links). */
  tags: PageHeaderLink[];
};

export const DEFAULT_PAGE_HEADER_SECTION: PageHeaderSectionData = {
  eyebrow: "Services",
  headline: "Design, Build\nAnd Everything Between",
  description:
    "We are a small, senior team. The people who scope your project are the people who design and build it — from the first flow to the final deploy.",
  surface: "alt",
  tags: [],
};

export function normalizePageHeaderSectionData(
  value: unknown,
): PageHeaderSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_PAGE_HEADER_SECTION,
      tags: [],
    };
  }
  const source = value as Record<string, unknown>;
  return {
    eyebrow: str(source.eyebrow, DEFAULT_PAGE_HEADER_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_PAGE_HEADER_SECTION.headline),
    description: str(
      source.description,
      DEFAULT_PAGE_HEADER_SECTION.description,
    ),
    surface: source.surface === "default" ? "default" : "alt",
    tags: normalizePageHeaderLinks(source.tags),
  };
}

function normalizePageHeaderLinks(value: unknown): PageHeaderLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 12)
    .map((item) => {
      const row =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      return {
        label: str(row.label, ""),
        href: str(row.href, ""),
      };
    })
    .filter((tag) => tag.label.trim().length > 0);
}

/* --- Service offerings (Services page detail list) --- */

export type ServiceOfferingTool = { label: string; href: string };

/** Icon keys resolved by `serviceOfferingIcon()` in the render component. */
const SERVICE_ICON_BY_SLUG: Record<string, string> = {
  "ux-design": "palette",
  "full-stack": "code",
  "wordpress-development": "pen-tool",
  "agency-partnerships": "handshake",
};

export function defaultServiceIcon(slug: string): string {
  return SERVICE_ICON_BY_SLUG[slug] ?? "sparkles";
}

export type ServiceOffering = {
  slug: string;
  /** Key into the shared icon registry (e.g. "palette", "code"). */
  icon: string;
  /** Index shown before the label: "04 / Service". */
  number: string;
  /** Small label after the index: "04 / Service". */
  label: string;
  title: string;
  description: string;
  /** Heading above the deliverables list ("What you get"). */
  deliverablesTitle: string;
  deliverables: string[];
  tools: ServiceOfferingTool[];
  buttonLabel: string;
  buttonHref: string;
  buttonNewTab: boolean;
  buttonNofollow: boolean;
};

export function defaultServiceOfferings(): ServiceOffering[] {
  return SERVICES.map((service, index) => ({
    slug: service.slug,
    icon: defaultServiceIcon(service.slug),
    number: String(index + 1).padStart(2, "0"),
    label: "Service",
    title: service.title,
    description: service.description,
    deliverablesTitle: "What you get",
    deliverables: [...service.deliverables],
    tools: service.tools.map((tool) => ({
      label: tool.label,
      href: tool.href ?? "",
    })),
    buttonLabel: "Discuss this service",
    buttonHref: "/contact",
    buttonNewTab: false,
    buttonNofollow: false,
  }));
}

/** Blank single-service template used when inserting a new service block. */
export function createServiceOffering(
  overrides: Partial<ServiceOffering> = {},
): ServiceOffering {
  return {
    slug: "new-service",
    icon: "sparkles",
    number: "01",
    label: "Service",
    title: "New service",
    description: "",
    deliverablesTitle: "What you get",
    deliverables: [""],
    tools: [],
    buttonLabel: "Discuss this service",
    buttonHref: "/contact",
    buttonNewTab: false,
    buttonNofollow: false,
    ...overrides,
  };
}

export type ServiceOfferingsSectionData = {
  service: ServiceOffering;
};

export const DEFAULT_SERVICE_OFFERINGS_SECTION: ServiceOfferingsSectionData = {
  service: defaultServiceOfferings()[0]!,
};

/** Data for a newly inserted service block. */
export function createServiceOfferingsSectionData(
  overrides: {
    service?: Partial<ServiceOffering>;
  } = {},
): ServiceOfferingsSectionData {
  return {
    service: createServiceOffering(overrides.service),
  };
}

function normalizeServiceOfferingsTools(value: unknown): ServiceOfferingTool[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 12)
    .map((item) => {
      const row =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      return { label: str(row.label, ""), href: str(row.href, "") };
    })
    .filter((tool) => tool.label.trim().length > 0);
}

function normalizeServiceOfferingsDeliverables(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 20)
    .map((item) => (typeof item === "string" ? item : ""))
    .filter((item) => item.trim().length > 0);
}

function normalizeServiceOffering(
  value: unknown,
  fallback: ServiceOffering,
): ServiceOffering {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...fallback,
      deliverables: [...fallback.deliverables],
      tools: fallback.tools.map((tool) => ({ ...tool })),
    };
  }

  const row = value as Record<string, unknown>;
  const slug = str(row.slug, fallback.slug);
  const deliverables = Array.isArray(row.deliverables)
    ? normalizeServiceOfferingsDeliverables(row.deliverables)
    : [...fallback.deliverables];
  const tools = Array.isArray(row.tools)
    ? normalizeServiceOfferingsTools(row.tools)
    : fallback.tools.map((tool) => ({ ...tool }));

  return {
    slug,
    icon: str(row.icon, defaultServiceIcon(slug)),
    number: str(row.number, fallback.number),
    label: str(row.label, fallback.label),
    title: str(row.title, fallback.title),
    description: str(row.description, fallback.description),
    deliverablesTitle: str(row.deliverablesTitle, fallback.deliverablesTitle),
    deliverables,
    tools,
    buttonLabel: str(row.buttonLabel, fallback.buttonLabel),
    buttonHref: str(row.buttonHref, fallback.buttonHref),
    buttonNewTab: bool(row.buttonNewTab, fallback.buttonNewTab),
    buttonNofollow: bool(row.buttonNofollow, fallback.buttonNofollow),
  };
}

export function normalizeServiceOfferingsSectionData(
  value: unknown,
): ServiceOfferingsSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_SERVICE_OFFERINGS_SECTION,
      service: normalizeServiceOffering(
        null,
        DEFAULT_SERVICE_OFFERINGS_SECTION.service,
      ),
    };
  }
  const source = value as Record<string, unknown>;
  // Legacy blocks stored an array of services; use the first one.
  const rawService =
    source.service ??
    (Array.isArray(source.services) ? source.services[0] : undefined);

  return {
    service: normalizeServiceOffering(
      rawService,
      DEFAULT_SERVICE_OFFERINGS_SECTION.service,
    ),
  };
}

/* --- Engagement models ("Three Ways To Work Together") --- */

export type EngagementCard = {
  title: string;
  description: string;
  bestFor: string;
};

export type EngagementModelsSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  models: EngagementCard[];
  buttonLabel: string;
  buttonHref: string;
  buttonNewTab: boolean;
  buttonNofollow: boolean;
  email: string;
  emailHref: string;
  emailNewTab: boolean;
  emailNofollow: boolean;
};

function defaultEngagementModels(): EngagementCard[] {
  return ENGAGEMENT_MODELS.map((model) => ({ ...model }));
}

export const DEFAULT_ENGAGEMENT_MODELS_SECTION: EngagementModelsSectionData = {
  eyebrow: "How We Work",
  headline: "Three Ways To Work Together",
  description:
    "No hourly surprises and no open-ended scopes. Pick the model that matches how your team already works.",
  models: defaultEngagementModels(),
  buttonLabel: "Request a quote",
  buttonHref: "/contact",
  buttonNewTab: false,
  buttonNofollow: false,
  email: SITE.email,
  emailHref: `mailto:${SITE.email}`,
  emailNewTab: false,
  emailNofollow: false,
};

function normalizeEngagementModels(value: unknown): EngagementCard[] {
  if (!Array.isArray(value)) {
    return DEFAULT_ENGAGEMENT_MODELS_SECTION.models.map((model) => ({
      ...model,
    }));
  }
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => ({
      title: str(item.title, ""),
      description: str(item.description, ""),
      bestFor: str(item.bestFor, ""),
    }));
}

export function normalizeEngagementModelsSectionData(
  value: unknown,
): EngagementModelsSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_ENGAGEMENT_MODELS_SECTION,
      models: normalizeEngagementModels(undefined),
    };
  }
  const source = value as Record<string, unknown>;
  const email = str(source.email, DEFAULT_ENGAGEMENT_MODELS_SECTION.email);
  return {
    eyebrow: str(source.eyebrow, DEFAULT_ENGAGEMENT_MODELS_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_ENGAGEMENT_MODELS_SECTION.headline),
    description: str(
      source.description,
      DEFAULT_ENGAGEMENT_MODELS_SECTION.description,
    ),
    models: normalizeEngagementModels(source.models),
    buttonLabel: str(
      source.buttonLabel,
      DEFAULT_ENGAGEMENT_MODELS_SECTION.buttonLabel,
    ),
    buttonHref: str(
      source.buttonHref,
      DEFAULT_ENGAGEMENT_MODELS_SECTION.buttonHref,
    ),
    buttonNewTab: bool(source.buttonNewTab, false),
    buttonNofollow: bool(source.buttonNofollow, false),
    email,
    emailHref: str(
      source.emailHref,
      email ? `mailto:${email}` : DEFAULT_ENGAGEMENT_MODELS_SECTION.emailHref,
    ),
    emailNewTab: bool(source.emailNewTab, false),
    emailNofollow: bool(source.emailNofollow, false),
  };
}

/* --- Page intro (About split hero) --- */

export type PageIntroStat = { value: string; label: string };

export type PageIntroSectionData = {
  eyebrow: string;
  headline: string;
  body: string;
  bodySecondary: string;
  primaryLabel: string;
  primaryHref: string;
  primaryNewTab: boolean;
  primaryNofollow: boolean;
  secondaryLabel: string;
  secondaryHref: string;
  secondaryNewTab: boolean;
  secondaryNofollow: boolean;
  /** @deprecated Visibility now follows the label; kept for older saves. */
  showSecondary: boolean;
  panelEyebrow: string;
  stats: PageIntroStat[];
  /** Location line under the stats panel. */
  panelFooter: string;
  /** Contact email shown under the stats panel. */
  panelEmail: string;
  panelEmailHref: string;
  panelEmailNewTab: boolean;
  panelEmailNofollow: boolean;
};

export const DEFAULT_PAGE_INTRO_SECTION: PageIntroSectionData = {
  eyebrow: "About Simply Code",
  headline: "A Small Team,\nSenior Delivery",
  body: "Simply Code is a web development agency that has been building for the web since 2016. We work remotely with clients that need design and engineering done properly.",
  bodySecondary:
    "We are deliberately small. The people who scope a project are the people who design and build it.",
  primaryLabel: "Work With Us",
  primaryHref: "/contact",
  primaryNewTab: false,
  primaryNofollow: false,
  secondaryLabel: "See Our Work",
  secondaryHref: "/work",
  secondaryNewTab: false,
  secondaryNofollow: false,
  showSecondary: true,
  panelEyebrow: "At a glance",
  stats: [
    { value: "12+", label: "Years Experience" },
    { value: "64+", label: "Projects Delivered" },
    { value: "100%", label: "Job Success" },
    { value: "8+", label: "Years with Zoom" },
  ],
  panelFooter: SITE.location,
  panelEmail: SITE.email,
  panelEmailHref: `mailto:${SITE.email}`,
  panelEmailNewTab: false,
  panelEmailNofollow: false,
};

export function normalizePageIntroSectionData(
  value: unknown,
): PageIntroSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_PAGE_INTRO_SECTION,
      stats: DEFAULT_PAGE_INTRO_SECTION.stats.map((s) => ({ ...s })),
    };
  }
  const source = value as Record<string, unknown>;
  const stats = Array.isArray(source.stats)
    ? source.stats.map(normalizeIntroStat)
    : DEFAULT_PAGE_INTRO_SECTION.stats.map((stat) => ({ ...stat }));
  const panelEmail = str(
    source.panelEmail,
    DEFAULT_PAGE_INTRO_SECTION.panelEmail,
  );
  return {
    eyebrow: str(source.eyebrow, DEFAULT_PAGE_INTRO_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_PAGE_INTRO_SECTION.headline),
    body: str(source.body, DEFAULT_PAGE_INTRO_SECTION.body),
    bodySecondary: str(
      source.bodySecondary,
      DEFAULT_PAGE_INTRO_SECTION.bodySecondary,
    ),
    primaryLabel: str(
      source.primaryLabel,
      DEFAULT_PAGE_INTRO_SECTION.primaryLabel,
    ),
    primaryHref: str(
      source.primaryHref,
      DEFAULT_PAGE_INTRO_SECTION.primaryHref,
    ),
    primaryNewTab: bool(
      source.primaryNewTab,
      DEFAULT_PAGE_INTRO_SECTION.primaryNewTab,
    ),
    primaryNofollow: bool(
      source.primaryNofollow,
      DEFAULT_PAGE_INTRO_SECTION.primaryNofollow,
    ),
    secondaryLabel: str(
      source.secondaryLabel,
      DEFAULT_PAGE_INTRO_SECTION.secondaryLabel,
    ),
    secondaryHref: str(
      source.secondaryHref,
      DEFAULT_PAGE_INTRO_SECTION.secondaryHref,
    ),
    secondaryNewTab: bool(
      source.secondaryNewTab,
      DEFAULT_PAGE_INTRO_SECTION.secondaryNewTab,
    ),
    secondaryNofollow: bool(
      source.secondaryNofollow,
      DEFAULT_PAGE_INTRO_SECTION.secondaryNofollow,
    ),
    showSecondary: bool(
      source.showSecondary,
      DEFAULT_PAGE_INTRO_SECTION.showSecondary,
    ),
    panelEyebrow: str(
      source.panelEyebrow,
      DEFAULT_PAGE_INTRO_SECTION.panelEyebrow,
    ),
    stats,
    panelFooter: str(
      source.panelFooter,
      DEFAULT_PAGE_INTRO_SECTION.panelFooter,
    ),
    panelEmail,
    panelEmailHref: str(
      source.panelEmailHref,
      panelEmail
        ? `mailto:${panelEmail}`
        : DEFAULT_PAGE_INTRO_SECTION.panelEmailHref,
    ),
    panelEmailNewTab: bool(
      source.panelEmailNewTab,
      DEFAULT_PAGE_INTRO_SECTION.panelEmailNewTab,
    ),
    panelEmailNofollow: bool(
      source.panelEmailNofollow,
      DEFAULT_PAGE_INTRO_SECTION.panelEmailNofollow,
    ),
  };
}

function normalizeIntroStat(value: unknown): PageIntroStat {
  const row =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    value: str(row.value, "—"),
    label: str(row.label, "Stat"),
  };
}

/* --- Feature grid (About values) --- */

export type FeatureGridIcon = "ruler" | "code" | "message" | "palette";

export type FeatureGridItem = {
  icon: FeatureGridIcon;
  title: string;
  body: string;
};

export type FeatureGridSectionData = {
  eyebrow: string;
  headline: string;
  features: FeatureGridItem[];
  surface: "default" | "alt";
};

export const DEFAULT_FEATURE_GRID_FEATURES: FeatureGridItem[] = [
  {
    icon: "ruler",
    title: "Pixel-perfect from design",
    body: "Your designs built exactly as drawn. No drift, no surprises — exact fidelity has been our specialty since day one.",
  },
  {
    icon: "code",
    title: "Clean, scalable code",
    body: "Built with best practices and modern technologies for long-term maintainability and growth, not just for launch day.",
  },
  {
    icon: "message",
    title: "Direct communication",
    body: "Talk directly to the developers building your project. No account managers, no middlemen, no miscommunication.",
  },
];

export const DEFAULT_FEATURE_GRID_SECTION: FeatureGridSectionData = {
  eyebrow: "What We Stand For",
  headline: "How We Work",
  features: DEFAULT_FEATURE_GRID_FEATURES,
  surface: "default",
};

export function normalizeFeatureGridSectionData(
  value: unknown,
): FeatureGridSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_FEATURE_GRID_SECTION,
      features: DEFAULT_FEATURE_GRID_FEATURES.map((f) => ({ ...f })),
    };
  }
  const source = value as Record<string, unknown>;
  const count =
    typeof source.featureCount === "number"
      ? Math.min(3, Math.max(1, source.featureCount))
      : 3;
  const features = Array.isArray(source.features)
    ? source.features.slice(0, count).map(normalizeFeatureItem)
    : DEFAULT_FEATURE_GRID_FEATURES.slice(0, count);
  return {
    eyebrow: str(source.eyebrow, DEFAULT_FEATURE_GRID_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_FEATURE_GRID_SECTION.headline),
    features:
      features.length > 0
        ? features
        : DEFAULT_FEATURE_GRID_FEATURES.slice(0, count),
    surface: source.surface === "alt" ? "alt" : "default",
  };
}

function normalizeFeatureItem(value: unknown): FeatureGridItem {
  const row =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const icons: FeatureGridIcon[] = ["ruler", "code", "message", "palette"];
  const icon = row.icon;
  return {
    icon: icons.includes(icon as FeatureGridIcon)
      ? (icon as FeatureGridIcon)
      : "ruler",
    title: str(row.title, "Feature"),
    body: str(row.body, ""),
  };
}

/* --- Steps (About process) --- */

export type StepsSectionStep = { title: string; body: string };

export type StepsSectionData = {
  eyebrow: string;
  headline: string;
  steps: StepsSectionStep[];
  surface: "alt" | "default";
};

export const DEFAULT_STEPS_SECTION: StepsSectionData = {
  eyebrow: "Process",
  headline: "From First Call\nTo Production",
  steps: [
    {
      title: "Discovery & scope",
      body: "We map the goals, audiences and constraints, then agree on a written scope with a fixed quote.",
    },
    {
      title: "UX & design",
      body: "Flows, wireframes and high-fidelity screens in Figma. Nothing is built before you approve the design.",
    },
    {
      title: "Build & integrate",
      body: "The people who designed it build it. Staging previews go out as sections are finished, not at the end.",
    },
    {
      title: "QA, launch & support",
      body: "Accessibility, performance and cross-browser checks before launch. Documentation and handover after.",
    },
  ],
  surface: "alt",
};

export function normalizeStepsSectionData(value: unknown): StepsSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_STEPS_SECTION,
      steps: DEFAULT_STEPS_SECTION.steps.map((s) => ({ ...s })),
    };
  }
  const source = value as Record<string, unknown>;
  const stepCount =
    typeof source.stepCount === "number"
      ? Math.min(4, Math.max(1, source.stepCount))
      : 4;
  const steps = Array.isArray(source.steps)
    ? source.steps.slice(0, stepCount).map(normalizeStep)
    : DEFAULT_STEPS_SECTION.steps.slice(0, stepCount);
  return {
    eyebrow: str(source.eyebrow, DEFAULT_STEPS_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_STEPS_SECTION.headline),
    steps:
      steps.length > 0
        ? steps
        : DEFAULT_STEPS_SECTION.steps.slice(0, stepCount),
    surface: source.surface === "default" ? "default" : "alt",
  };
}

function normalizeStep(value: unknown): StepsSectionStep {
  const row =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    title: str(row.title, "Step"),
    body: str(row.body, ""),
  };
}

/* --- Team --- */

export type TeamSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  anchorId: string;
  surface: "default" | "alt";
};

export const DEFAULT_TEAM_SECTION: TeamSectionData = {
  eyebrow: "Our Team",
  headline: "Meet The Experts",
  description:
    "A dedicated team of developers and specialists committed to delivering exceptional results for every project.",
  anchorId: "team",
  surface: "default",
};

export function normalizeTeamSectionData(value: unknown): TeamSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_TEAM_SECTION };
  }
  const source = value as Record<string, unknown>;
  return {
    eyebrow: str(source.eyebrow, DEFAULT_TEAM_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_TEAM_SECTION.headline),
    description: str(source.description, DEFAULT_TEAM_SECTION.description),
    anchorId: str(source.anchorId, DEFAULT_TEAM_SECTION.anchorId),
    surface: source.surface === "alt" ? "alt" : "default",
  };
}
