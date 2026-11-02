import Link from "next/link";
import type { ReactNode } from "react";
import { HeroSection } from "~/components/content/hero-section";
import {
  HERO_NODE_TYPE,
  normalizeHeroData,
  type ContentDocument,
  type ContentNode,
} from "~/lib/content";
import { isExternalHref } from "~/lib/link-options";
import { QUOTE_INNER_TYPE } from "~/components/lexical/quote-inner-node";
import { appQuoteInner, appQuoteOuter } from "~/lib/surface";
import { cn } from "~/lib/utils";

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;
const FORMAT_SUBSCRIPT = 32;
const FORMAT_SUPERSCRIPT = 64;
const FORMAT_HIGHLIGHT = 128;

function renderText(node: ContentNode, key: string): ReactNode {
  const text = typeof node.text === "string" ? node.text : "";
  if (!text) return null;

  const format = typeof node.format === "number" ? node.format : 0;
  let content: ReactNode = text;

  if (format & FORMAT_CODE) {
    content = (
      <code className="rounded bg-[#15130f]/5 px-1 py-0.5 font-mono text-[0.9em]">
        {content}
      </code>
    );
  }
  if (format & FORMAT_HIGHLIGHT) {
    content = <mark className="bg-yellow-200/70 px-0.5">{content}</mark>;
  }
  if (format & FORMAT_SUPERSCRIPT) content = <sup>{content}</sup>;
  if (format & FORMAT_SUBSCRIPT) content = <sub>{content}</sub>;
  if (format & FORMAT_UNDERLINE) content = <u>{content}</u>;
  if (format & FORMAT_STRIKETHROUGH) content = <s>{content}</s>;
  if (format & FORMAT_ITALIC) content = <em>{content}</em>;
  if (format & FORMAT_BOLD) content = <strong>{content}</strong>;

  return <span key={key}>{content}</span>;
}

function renderChildren(
  children: ContentNode[] | undefined,
  prefix: string,
): ReactNode[] {
  if (!children) return [];
  return children.map((child, index) =>
    renderNode(child, `${prefix}-${index}`),
  );
}

function HeadingBlock({
  node,
  keyName,
}: {
  node: ContentNode;
  keyName: string;
}) {
  const tag = node.tag === "h1" ? "h1" : node.tag === "h3" ? "h3" : "h2";
  const className =
    tag === "h1"
      ? "mt-12 mb-5 text-[clamp(2rem,4vw,3.2rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase"
      : tag === "h3"
        ? "mt-8 mb-3 text-[1.35rem] leading-tight font-black tracking-[-0.02em]"
        : "mt-12 mb-4 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] font-black tracking-[-0.03em] uppercase";
  const content = renderChildren(node.children, keyName);

  if (tag === "h1")
    return (
      <h1 key={keyName} className={className}>
        {content}
      </h1>
    );
  if (tag === "h3")
    return (
      <h3 key={keyName} className={className}>
        {content}
      </h3>
    );
  return (
    <h2 key={keyName} className={className}>
      {content}
    </h2>
  );
}

function ListBlock({ node, keyName }: { node: ContentNode; keyName: string }) {
  const ordered = node.listType === "number" || node.tag === "ol";
  const className = cn(
    "mb-5 space-y-1.5 pl-6 text-[16px] leading-[1.75] text-[#3f3b34]",
    ordered ? "list-decimal" : "list-disc",
  );
  const content = renderChildren(node.children, keyName);

  return ordered ? (
    <ol key={keyName} className={className}>
      {content}
    </ol>
  ) : (
    <ul key={keyName} className={className}>
      {content}
    </ul>
  );
}

function LinkBlock({ node, keyName }: { node: ContentNode; keyName: string }) {
  const href = typeof node.url === "string" ? node.url : "";
  const content = renderChildren(node.children, keyName);
  const className = "text-sc-accent underline underline-offset-2";
  const target =
    typeof node.target === "string" && node.target.trim()
      ? node.target
      : undefined;
  const rel =
    typeof node.rel === "string" && node.rel.trim() ? node.rel : undefined;
  const newTab = target === "_blank";

  if (!href) return <span key={keyName}>{content}</span>;

  const external = isExternalHref(href);
  if (external) {
    return (
      <a
        key={keyName}
        href={href}
        className={className}
        rel={rel}
        target={newTab ? "_blank" : undefined}
      >
        {content}
      </a>
    );
  }

  if (newTab) {
    return (
      <Link key={keyName} href={href} className={className} rel={rel} target="_blank">
        {content}
      </Link>
    );
  }

  return (
    <Link key={keyName} href={href} className={className} rel={rel}>
      {content}
    </Link>
  );
}

const CONTENT_BLOCK_WRAP = "mx-auto w-full max-w-[1400px] px-6";

function hasVisibleInlineContent(children: ContentNode[]): boolean {
  return children.some((child) =>
    typeof child.text === "string"
      ? child.text.trim().length > 0
      : child.type !== "text",
  );
}

/**
 * Renders the root children: block decorators (hero) stay full-bleed while
 * prose blocks span the page width. Legacies where the hero was nested in a
 * paragraph are hoisted out so the layout matches the homepage.
 */
function renderRoot(children: ContentNode[] | undefined): ReactNode[] {
  if (!children) return [];

  const nodes: ReactNode[] = [];
  let needsSpacingAfterHero = false;

  children.forEach((child, index) => {
    const keyName = `root-${index}`;

    if (child.type === HERO_NODE_TYPE) {
      nodes.push(renderNode(child, keyName));
      needsSpacingAfterHero = true;
      return;
    }

    if (child.type === "paragraph" && Array.isArray(child.children)) {
      const heroes = child.children.filter(
        (grandchild) => grandchild.type === HERO_NODE_TYPE,
      );

      if (heroes.length > 0) {
        const inline = child.children.filter(
          (grandchild) => grandchild.type !== HERO_NODE_TYPE,
        );

        if (hasVisibleInlineContent(inline)) {
          nodes.push(
            <div
              key={`${keyName}-wrap`}
              className={cn(
                CONTENT_BLOCK_WRAP,
                needsSpacingAfterHero && "pt-12",
              )}
            >
              {renderNode({ ...child, children: inline }, keyName)}
            </div>,
          );
          needsSpacingAfterHero = false;
        }

        heroes.forEach((hero, heroIndex) => {
          nodes.push(
            renderNode(hero, `${keyName}-hero-${heroIndex}`),
          );
        });
        needsSpacingAfterHero = true;
        return;
      }
    }

    if (
      child.type === "paragraph" &&
      !hasVisibleInlineContent(child.children ?? [])
    ) {
      return;
    }

    nodes.push(
      <div
        key={`${keyName}-wrap`}
        className={cn(
          CONTENT_BLOCK_WRAP,
          needsSpacingAfterHero && "pt-12",
        )}
      >
        {renderNode(child, keyName)}
      </div>,
    );
    needsSpacingAfterHero = false;
  });

  return nodes;
}

function renderNode(node: ContentNode, keyName: string): ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, keyName);
    case "linebreak":
      return <br key={keyName} />;
    case "root":
      return <>{renderRoot(node.children)}</>;
    case "paragraph": {
      // Older saves (or pasted content) may nest the hero decorator inside a
      // paragraph, which is invalid HTML (`<section>` inside `<p>`). Render the
      // container as a `<div>` in that case.
      const hasBlockChild = node.children?.some(
        (child) => child.type === HERO_NODE_TYPE || child.type === "paragraph",
      );

      if (hasBlockChild) {
        return (
          <div key={keyName} className="whitespace-pre-wrap">
            {renderChildren(node.children, keyName)}
          </div>
        );
      }

      return (
        <p
          key={keyName}
          className="mb-5 text-[16px] leading-[1.8] whitespace-pre-wrap text-[#3f3b34]"
        >
          {renderChildren(node.children, keyName)}
        </p>
      );
    }
    case "heading":
      return <HeadingBlock key={keyName} node={node} keyName={keyName} />;
    case "quote": {
      const inner = node.children?.find((child) => child.type === QUOTE_INNER_TYPE);
      return (
        <blockquote key={keyName} className={cn("my-7", appQuoteOuter)}>
          {inner ? (
            renderNode(inner, `${keyName}-inner`)
          ) : (
            <span className={appQuoteInner}>
              {renderChildren(node.children, keyName)}
            </span>
          )}
        </blockquote>
      );
    }
    case QUOTE_INNER_TYPE:
      return (
        <span key={keyName} className={appQuoteInner}>
          {renderChildren(node.children, keyName)}
        </span>
      );
    case "list":
      return <ListBlock key={keyName} node={node} keyName={keyName} />;
    case "listitem":
      return <li key={keyName}>{renderChildren(node.children, keyName)}</li>;
    case "link":
      return <LinkBlock key={keyName} node={node} keyName={keyName} />;
    case HERO_NODE_TYPE:
      return <HeroSection key={keyName} data={normalizeHeroData(node.data)} />;
    default:
      return node.children ? (
        <div key={keyName}>{renderChildren(node.children, keyName)}</div>
      ) : null;
  }
}

/** Server-side Lexical JSON renderer. Never ships the editor to the client. */
export function ContentRenderer({
  document,
  className,
}: {
  document: ContentDocument;
  className?: string;
}) {
  return (
    <div className={cn("content-body", className)}>
      {renderNode(document.root, "root")}
    </div>
  );
}
