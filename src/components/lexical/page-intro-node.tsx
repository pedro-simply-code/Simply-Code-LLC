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
import { PageIntroSection } from "~/components/content/page-intro-section";
import {
  BlockDecoratorToolbar,
  SectionOptionCheckbox,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import {
  DEFAULT_PAGE_INTRO_SECTION,
  normalizePageIntroSectionData,
  PAGE_INTRO_SECTION_NODE_TYPE,
  type PageIntroSectionData,
} from "~/lib/site-page-sections";

export type SerializedPageIntroSectionNode = Spread<
  { data: PageIntroSectionData },
  SerializedLexicalNode
>;

export class PageIntroSectionNode extends DecoratorNode<ReactElement> {
  __data: PageIntroSectionData;

  static getType(): string {
    return PAGE_INTRO_SECTION_NODE_TYPE;
  }

  static clone(node: PageIntroSectionNode): PageIntroSectionNode {
    return new PageIntroSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedPageIntroSectionNode,
  ): PageIntroSectionNode {
    return $createPageIntroSectionNode(
      normalizePageIntroSectionData(serializedNode.data),
    );
  }

  constructor(data?: PageIntroSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizePageIntroSectionData(data);
  }

  exportJSON(): SerializedPageIntroSectionNode {
    return {
      ...super.exportJSON(),
      type: PAGE_INTRO_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-page-intro-node";
    div.dataset.editorBlock = "page-intro";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): PageIntroSectionData {
    return this.getLatest().__data;
  }

  setData(data: PageIntroSectionData): this {
    const writable = this.getWritable();
    writable.__data = normalizePageIntroSectionData(data);
    return writable;
  }

  decorate(): ReactElement {
    return (
      <PageIntroSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createPageIntroSectionNode(
  data: PageIntroSectionData = DEFAULT_PAGE_INTRO_SECTION,
): PageIntroSectionNode {
  return $applyNodeReplacement(new PageIntroSectionNode(data));
}

export function $isPageIntroSectionNode(
  node: LexicalNode | null | undefined,
): node is PageIntroSectionNode {
  return node instanceof PageIntroSectionNode;
}

function PageIntroSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: PageIntroSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isPageIntroSectionNode,
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="page-intro"
    >
      <BlockDecoratorToolbar label="Page intro" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Page intro"
          description="Edit headline and body text on the canvas (select the block, then click text). Stats use the panel defaults."
        >
          <SectionOptionCheckbox
            label="Show secondary button"
            checked={data.showSecondary}
            onChange={(checked) => update({ showSecondary: checked })}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <PageIntroSection data={data} />
    </div>
  );
}
