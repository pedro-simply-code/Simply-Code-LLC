"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { ArrowRight, Link2, Settings2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { WorkCard } from "~/components/work-card";
import { PROJECTS } from "~/content/projects";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import { LinkUrlPopover } from "~/components/lexical/link-url-popover";
import {
  DEFAULT_WORK_SECTION,
  normalizeWorkSectionData,
  WORK_SECTION_NODE_TYPE,
  type WorkSectionData,
} from "~/lib/homepage-sections";
import type { LinkFieldValue } from "~/lib/link-options";
import { appEmptyState, appSectionBand, appSectionContainer } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type SerializedWorkSectionNode = Spread<
  { data: WorkSectionData },
  SerializedLexicalNode
>;

export class WorkSectionNode extends DecoratorNode<ReactElement> {
  __data: WorkSectionData;

  static getType(): string {
    return WORK_SECTION_NODE_TYPE;
  }

  static clone(node: WorkSectionNode): WorkSectionNode {
    return new WorkSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedWorkSectionNode,
  ): WorkSectionNode {
    return $createWorkSectionNode(
      normalizeWorkSectionData(serializedNode.data),
    );
  }

  constructor(data?: WorkSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeWorkSectionData(data);
  }

  exportJSON(): SerializedWorkSectionNode {
    return {
      ...super.exportJSON(),
      type: WORK_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-work-node";
    div.dataset.editorBlock = "work";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): WorkSectionData {
    return this.getLatest().__data;
  }

  setData(data: WorkSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <WorkSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createWorkSectionNode(
  data: WorkSectionData = DEFAULT_WORK_SECTION,
): WorkSectionNode {
  return $applyNodeReplacement(new WorkSectionNode(data));
}

export function $isWorkSectionNode(
  node: LexicalNode | null | undefined,
): node is WorkSectionNode {
  return node instanceof WorkSectionNode;
}

function WorkSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: WorkSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isWorkSectionNode);
  const [previewEmpty, setPreviewEmpty] = useState(false);

  const featured = previewEmpty
    ? []
    : PROJECTS.slice(0, data.projectCount);

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="work"
    >
      <BlockDecoratorToolbar label="Work" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Featured work"
          description="Projects load from the site catalog when published. Edit headings and copy on the canvas."
        >
          <SectionOptionSelect
            label="Projects shown"
            value={data.projectCount}
            onChange={(value) =>
              update({
                projectCount: Math.min(
                  6,
                  Math.max(1, Number(value) || DEFAULT_WORK_SECTION.projectCount),
                ),
              })
            }
            options={[1, 2, 3, 4, 5, 6].map((count) => ({
              value: count,
              label: `${count} project${count === 1 ? "" : "s"}`,
            }))}
          />
          <SectionOptionCheckbox
            label='Show "See all work" button'
            checked={data.showCta}
            onChange={(checked) => update({ showCta: checked })}
          />
          <SectionOptionCheckbox
            label="Preview empty state (editor only)"
            checked={previewEmpty}
            onChange={setPreviewEmpty}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <section className={cn(appSectionBand, "relative overflow-hidden")}>
        <div className={appSectionContainer}>
          <div className="mb-16 max-w-2xl">
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(v) => update({ eyebrow: v })}
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              value={data.headline}
              onChange={(v) => update({ headline: v })}
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] font-black uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.description}
              onChange={(v) => update({ description: v })}
              className="mt-6 text-[16px] text-[#57524a]"
            />
          </div>
          {featured.length > 0 ? (
            <>
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((project) => (
                  <WorkCard key={project.slug} project={project} />
                ))}
              </div>
              {data.showCta && data.ctaLabel.trim() ? (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  <InlineText
                    value={data.ctaLabel}
                    onChange={(v) => update({ ctaLabel: v })}
                    className="rounded-md bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase"
                  />
                  <LinkUrlPopover
                    value={{
                      href: data.ctaHref,
                      newTab: data.ctaNewTab,
                      nofollow: false,
                    }}
                    onPrepare={() => ({
                      href: data.ctaHref,
                      newTab: data.ctaNewTab,
                      nofollow: false,
                    })}
                    onSave={(value: LinkFieldValue) =>
                      update({ ctaHref: value.href, ctaNewTab: value.newTab })
                    }
                    trigger={
                      <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded border bg-white"
                        aria-label="Edit CTA link"
                      >
                        <Link2 className="size-4" />
                      </button>
                    }
                  />
                  <ArrowRight className="size-4" aria-hidden />
                </div>
              ) : null}
            </>
          ) : (
            <p className={cn(appEmptyState, "py-16 text-center text-[#57524a]")}>
              <InlineText
                value={data.emptyMessage}
                onChange={(v) => update({ emptyMessage: v })}
                className="block text-[15px]"
              />
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
