/**
 * Shared content model for the Studio CMS.
 *
 * Heavy editor code lives under `~/components/lexical`; this module stays
 * dependency-free so it can be imported from the Drizzle schema, server
 * actions and client components alike.
 */

export const CONTENT_KINDS = ["page", "post"] as const;
export type ContentKindName = (typeof CONTENT_KINDS)[number];

export const CONTENT_STATUSES = ["draft", "published"] as const;
export type ContentStatusName = (typeof CONTENT_STATUSES)[number];

export const CONTENT_KIND_LABEL: Record<ContentKindName, string> = {
  page: "Page",
  post: "Post",
};

export const CONTENT_STATUS_LABEL: Record<ContentStatusName, string> = {
  draft: "Draft",
  published: "Published",
};

export function isContentKind(value: unknown): value is ContentKindName {
  return (
    typeof value === "string" &&
    (CONTENT_KINDS as readonly string[]).includes(value)
  );
}

export function isContentStatus(value: unknown): value is ContentStatusName {
  return (
    typeof value === "string" &&
    (CONTENT_STATUSES as readonly string[]).includes(value)
  );
}

/* -------------------------------------------------------------------------- */
/* Hero block                                                                  */
/* -------------------------------------------------------------------------- */

export type HeroStat = {
  value: string;
  label: string;
};

export type HeroData = {
  eyebrow: string;
  headline: string;
  /** Substring of `headline` rendered in the accent colour. */
  highlight: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  badge: string;
  panelText: string;
  stats: HeroStat[];
};

/** Mirrors the homepage hero so new pages start from the same design. */
export const DEFAULT_HERO: HeroData = {
  eyebrow: "Web Development Agency",
  headline: "We build high-performance web solutions that drive results",
  highlight: "web solutions",
  description:
    "A full-service digital agency specializing in UX design, custom Next.js applications, WordPress solutions and scalable web platforms.",
  primaryLabel: "Start Your Project",
  primaryHref: "#contact",
  secondaryLabel: "View Our Work",
  secondaryHref: "/work",
  badge: "Since 2016",
  panelText: "Clean code and business outcomes — not generic templates.",
  stats: [
    { value: "10+", label: "Years building" },
    { value: "60+", label: "Projects shipped" },
    { value: "98%", label: "Client retention" },
    { value: "4.9", label: "Average rating" },
  ],
};

function heroString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

/** Coerce persisted JSON into a complete hero payload. */
export function normalizeHeroData(value: unknown): HeroData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_HERO,
      stats: DEFAULT_HERO.stats.map((stat) => ({ ...stat })),
    };
  }

  const source = value as Record<string, unknown>;
  const stats = Array.isArray(source.stats)
    ? source.stats
        .slice(0, 6)
        .map((stat) => {
          const row =
            stat && typeof stat === "object"
              ? (stat as Record<string, unknown>)
              : {};
          return {
            value: heroString(row.value, ""),
            label: heroString(row.label, ""),
          };
        })
        .filter((stat) => stat.value.trim() || stat.label.trim())
    : [];

  return {
    eyebrow: heroString(source.eyebrow, DEFAULT_HERO.eyebrow),
    headline: heroString(source.headline, DEFAULT_HERO.headline),
    highlight: heroString(source.highlight, DEFAULT_HERO.highlight),
    description: heroString(source.description, DEFAULT_HERO.description),
    primaryLabel: heroString(source.primaryLabel, DEFAULT_HERO.primaryLabel),
    primaryHref: heroString(source.primaryHref, DEFAULT_HERO.primaryHref),
    secondaryLabel: heroString(
      source.secondaryLabel,
      DEFAULT_HERO.secondaryLabel,
    ),
    secondaryHref: heroString(source.secondaryHref, DEFAULT_HERO.secondaryHref),
    badge: heroString(source.badge, DEFAULT_HERO.badge),
    panelText: heroString(source.panelText, DEFAULT_HERO.panelText),
    stats,
  };
}

/* -------------------------------------------------------------------------- */
/* Lexical document helpers                                                    */
/* -------------------------------------------------------------------------- */

export const HERO_NODE_TYPE = "hero-section";

/** Minimal structural shape of a serialized Lexical node. */
export type ContentNode = {
  type: string;
  text?: string;
  children?: ContentNode[];
  data?: unknown;
  [key: string]: unknown;
};

export type ContentDocument = {
  root: ContentNode;
};

export const EMPTY_CONTENT_DOCUMENT: ContentDocument = {
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [],
      },
    ],
  },
};

export function emptyContentDocument(): ContentDocument {
  return JSON.parse(JSON.stringify(EMPTY_CONTENT_DOCUMENT)) as ContentDocument;
}

function isContentNode(value: unknown): value is ContentNode {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

/**
 * Block decorators (the hero) must be root children. Older saves may have
 * nested them inside a paragraph, so lift them out while parsing.
 */
function liftNestedBlocks(children: ContentNode[]): ContentNode[] {
  const result: ContentNode[] = [];

  for (const child of children) {
    if (child.type === "paragraph" && Array.isArray(child.children)) {
      const nestedBlocks = child.children.filter(
        (grandchild) => grandchild.type === HERO_NODE_TYPE,
      );

      if (nestedBlocks.length > 0) {
        const inline = child.children.filter(
          (grandchild) => grandchild.type !== HERO_NODE_TYPE,
        );
        const hasInlineContent = inline.some((grandchild) =>
          typeof grandchild.text === "string"
            ? grandchild.text.trim().length > 0
            : grandchild.type !== "text",
        );

        if (hasInlineContent) result.push({ ...child, children: inline });
        result.push(...nestedBlocks);
        continue;
      }
    }

    result.push(child);
  }

  return result;
}

/** Validate (and lightly repair) a serialized editor state from the client. */
export function parseContentDocument(value: unknown): ContentDocument | null {
  if (typeof value === "string") {
    try {
      return parseContentDocument(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = (value as { root?: unknown }).root;
  if (!isContentNode(root) || root.type !== "root") return null;

  const children = Array.isArray(root.children) ? root.children : [];
  const cleaned = liftNestedBlocks(children.filter(isContentNode));

  return {
    root: {
      ...root,
      children:
        cleaned.length > 0 ? cleaned : EMPTY_CONTENT_DOCUMENT.root.children,
    },
  };
}

function collectPlainText(node: ContentNode, parts: string[]): void {
  if (typeof node.text === "string") parts.push(node.text);

  if (node.type === HERO_NODE_TYPE) {
    const hero = normalizeHeroData(node.data);
    parts.push(
      hero.eyebrow,
      hero.headline,
      hero.description,
      hero.badge,
      hero.panelText,
      hero.primaryLabel,
      hero.secondaryLabel,
      ...hero.stats.flatMap((stat) => [stat.value, stat.label]),
    );
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (isContentNode(child)) collectPlainText(child, parts);
    }
  }
}

export function contentPlainText(document: ContentDocument): string {
  const parts: string[] = [];
  collectPlainText(document.root, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function contentWordCount(document: ContentDocument): number {
  const text = contentPlainText(document);
  return text ? text.split(" ").length : 0;
}

/** Rough reading time at ~200 words per minute (minimum one minute). */
export function contentReadingTime(document: ContentDocument): number {
  return Math.max(1, Math.ceil(contentWordCount(document) / 200));
}

/** True when the entry starts with a hero block (optionally nested in a paragraph). */
export function contentStartsWithHero(document: ContentDocument): boolean {
  const children = document.root.children ?? [];

  for (const first of children) {
    // Ignore leading empty paragraphs left behind by the editor.
    if (
      first.type === "paragraph" &&
      Array.isArray(first.children) &&
      first.children.every(
        (child) =>
          child.type !== HERO_NODE_TYPE &&
          (typeof child.text !== "string" || child.text.trim().length === 0),
      )
    ) {
      continue;
    }

    if (first.type === HERO_NODE_TYPE) return true;

    return (
      first.type === "paragraph" &&
      Array.isArray(first.children) &&
      first.children.some((child) => child.type === HERO_NODE_TYPE)
    );
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Slugs & routes                                                              */
/* -------------------------------------------------------------------------- */

export const RESERVED_SLUGS = new Set([
  "about",
  "accept-invite",
  "api",
  "blog",
  "contact",
  "dashboard",
  "faq",
  "login",
  "manifest.webmanifest",
  "portal",
  "privacy",
  "register",
  "robots.txt",
  "services",
  "sitemap.xml",
  "studio",
  "terms",
  "work",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function contentHref(kind: ContentKindName, slug: string): string {
  return kind === "post" ? `/blog/${slug}` : `/${slug}`;
}

/** Posts are collected under `/blog`; pages live at the site root. */
export function contentPublicPath(kind: ContentKindName, slug: string): string {
  return contentHref(kind, slug);
}

const CONTENT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatContentDate(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return CONTENT_DATE_FORMATTER.format(date);
}

const CONTENT_ERRORS: Record<string, string> = {
  kind: "Choose a valid content type.",
  title: "Add a title before saving.",
  slug: "Add a valid slug before saving.",
  reserved: "That slug is reserved by an existing route. Pick another one.",
  status: "Choose a valid status.",
  body: "The editor content could not be read. Try again.",
  duplicate: "Another entry of that type already uses this slug.",
  missing: "That entry no longer exists.",
};

export function contentErrorMessage(error?: string | null): string | null {
  if (!error) return null;
  return CONTENT_ERRORS[error] ?? "Could not save your changes.";
}
