"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Settings2 } from "lucide-react";
import { type ReactElement } from "react";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import {
  DEFAULT_PAGE_HEADER_SECTION,
  normalizePageHeaderSectionData,
  PAGE_HEADER_SECTION_NODE_TYPE,
  type PageHeaderSectionData,
} from "~/lib/site-page-sections";
import { appSectionBand, appSectionContainer } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type SerializedPageHeaderSectionNode = Spread<
  { data: PageHeaderSectionData },
  SerializedLexicalNode
>;

export class PageHeaderSectionNode extends DecoratorNode<ReactElement> {
  __data: PageHeaderSectionData;

  static getType(): string {
    return PAGE_HEADER_SECTION_NODE_TYPE;
  }

  static clone(node: PageHeaderSectionNode): PageHeaderSectionNode {
    return new PageHeaderSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedPageHeaderSectionNode,
  ): PageHeaderSectionNode {
    return $createPageHeaderSectionNode(
      normalizePageHeaderSectionData(serializedNode.data),
    );
  }

  constructor(data?: PageHeaderSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizePageHeaderSectionData(data);
  }

  exportJSON(): SerializedPageHeaderSectionNode {
    return {
      ...super.exportJSON(),
      type: PAGE_HEADER_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-page-header-node";
    div.dataset.editorBlock = "page-header";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): PageHeaderSectionData {
    return this.getLatest().__data;
  }

  setData(data: PageHeaderSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <PageHeaderSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createPageHeaderSectionNode(
  data: PageHeaderSectionData = DEFAULT_PAGE_HEADER_SECTION,
): PageHeaderSectionNode {
  return $applyNodeReplacement(new PageHeaderSectionNode(data));
}

export function $isPageHeaderSectionNode(
  node: LexicalNode | null | undefined,
): node is PageHeaderSectionNode {
  return node instanceof PageHeaderSectionNode;
}

function PageHeaderSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: PageHeaderSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isPageHeaderSectionNode,
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="page-header"
    >
      <BlockDecoratorToolbar label="Page header" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Page header"
        >
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({
                surface: value === "default" ? "default" : "alt",
              })
            }
            options={[
              { value: "alt", label: "Alt band" },
              { value: "default", label: "Default band" },
            ]}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <section
        className={cn(
          appSectionBand,
          "border-b border-[#15130f]/10 py-16 lg:py-24",
          data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
        )}
      >
        <div className={appSectionContainer}>
          <InlineText
            as="p"
            value={data.eyebrow}
            onChange={(eyebrow) => update({ eyebrow })}
            className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
          />
          <InlineText
            as="h1"
            value={data.headline}
            onChange={(headline) => update({ headline })}
            className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase whitespace-pre-line"
          />
          <InlineText
            as="p"
            value={data.description}
            onChange={(description) => update({ description })}
            className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]"
          />
        </div>
      </section>
    </div>
  );
}
