/**
 * Site marketing page blocks (About, Services headers, etc.) — Lexical decorators.
 */

export const PAGE_HEADER_SECTION_NODE_TYPE = "page-header-section";
export const PAGE_INTRO_SECTION_NODE_TYPE = "page-intro-section";
export const FEATURE_GRID_SECTION_NODE_TYPE = "feature-grid-section";
export const STEPS_SECTION_NODE_TYPE = "steps-section";
export const TEAM_SECTION_NODE_TYPE = "team-section";

export const SITE_PAGE_BLOCK_NODE_TYPES = [
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  STEPS_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
] as const;

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/* --- Page header (Services / Contact style) --- */

export type PageHeaderSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  surface: "alt" | "default";
};

export const DEFAULT_PAGE_HEADER_SECTION: PageHeaderSectionData = {
  eyebrow: "Services",
  headline: "Design, Build\nAnd Everything Between",
  description:
    "We are a small, senior team. The people who scope your project are the people who design and build it — from the first flow to the final deploy.",
  surface: "alt",
};

export function normalizePageHeaderSectionData(
  value: unknown,
): PageHeaderSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_PAGE_HEADER_SECTION };
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
  secondaryLabel: string;
  secondaryHref: string;
  showSecondary: boolean;
  panelEyebrow: string;
  stats: PageIntroStat[];
  panelFooter: string;
};

export const DEFAULT_PAGE_INTRO_SECTION: PageIntroSectionData = {
  eyebrow: "About Simply Code",
  headline: "A Small Team,\nSenior Delivery",
  body: "Simply Code is a web development agency that has been building for the web since 2016. We work remotely with clients that need design and engineering done properly.",
  bodySecondary:
    "We are deliberately small. The people who scope a project are the people who design and build it.",
  primaryLabel: "Work With Us",
  primaryHref: "/contact",
  secondaryLabel: "See Our Work",
  secondaryHref: "/work",
  showSecondary: true,
  panelEyebrow: "At a glance",
  stats: [
    { value: "12+", label: "Years Experience" },
    { value: "64+", label: "Projects Delivered" },
    { value: "100%", label: "Job Success" },
    { value: "8+", label: "Years with Zoom" },
  ],
  panelFooter: "Remote · Guatemala & United States",
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
    ? source.stats.slice(0, 4).map(normalizeIntroStat)
    : DEFAULT_PAGE_INTRO_SECTION.stats;
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
    secondaryLabel: str(
      source.secondaryLabel,
      DEFAULT_PAGE_INTRO_SECTION.secondaryLabel,
    ),
    secondaryHref: str(
      source.secondaryHref,
      DEFAULT_PAGE_INTRO_SECTION.secondaryHref,
    ),
    showSecondary: bool(
      source.showSecondary,
      DEFAULT_PAGE_INTRO_SECTION.showSecondary,
    ),
    panelEyebrow: str(
      source.panelEyebrow,
      DEFAULT_PAGE_INTRO_SECTION.panelEyebrow,
    ),
    stats: stats.length > 0 ? stats : DEFAULT_PAGE_INTRO_SECTION.stats,
    panelFooter: str(
      source.panelFooter,
      DEFAULT_PAGE_INTRO_SECTION.panelFooter,
    ),
  };
}

function normalizeIntroStat(value: unknown): PageIntroStat {
  const row =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
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
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
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
    steps: steps.length > 0 ? steps : DEFAULT_STEPS_SECTION.steps.slice(0, stepCount),
    surface: source.surface === "default" ? "default" : "alt",
  };
}

function normalizeStep(value: unknown): StepsSectionStep {
  const row =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
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
    description: str(
      source.description,
      DEFAULT_TEAM_SECTION.description,
    ),
    anchorId: str(source.anchorId, DEFAULT_TEAM_SECTION.anchorId),
    surface: source.surface === "alt" ? "alt" : "default",
  };
}
