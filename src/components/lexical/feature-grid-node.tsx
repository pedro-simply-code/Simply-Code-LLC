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
import { FeatureGridSection } from "~/components/content/feature-grid-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import {
  DEFAULT_FEATURE_GRID_SECTION,
  normalizeFeatureGridSectionData,
  FEATURE_GRID_SECTION_NODE_TYPE,
  type FeatureGridSectionData,
} from "~/lib/site-page-sections";
import { appSectionBand, appSectionContainer } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type SerializedFeatureGridSectionNode = Spread<
  { data: FeatureGridSectionData },
  SerializedLexicalNode
>;

export class FeatureGridSectionNode extends DecoratorNode<ReactElement> {
  __data: FeatureGridSectionData;

  static getType(): string {
    return FEATURE_GRID_SECTION_NODE_TYPE;
  }

  static clone(node: FeatureGridSectionNode): FeatureGridSectionNode {
    return new FeatureGridSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedFeatureGridSectionNode,
  ): FeatureGridSectionNode {
    return $createFeatureGridSectionNode(
      normalizeFeatureGridSectionData(serializedNode.data),
    );
  }

  constructor(data?: FeatureGridSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeFeatureGridSectionData(data);
  }

  exportJSON(): SerializedFeatureGridSectionNode {
    return {
      ...super.exportJSON(),
      type: FEATURE_GRID_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-feature-grid-node";
    div.dataset.editorBlock = "feature-grid";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): FeatureGridSectionData {
    return this.getLatest().__data;
  }

  setData(data: FeatureGridSectionData): this {
    const writable = this.getWritable();
    writable.__data = normalizeFeatureGridSectionData(data);
    return writable;
  }

  decorate(): ReactElement {
    return (
      <FeatureGridSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createFeatureGridSectionNode(
  data: FeatureGridSectionData = DEFAULT_FEATURE_GRID_SECTION,
): FeatureGridSectionNode {
  return $applyNodeReplacement(new FeatureGridSectionNode(data));
}

export function $isFeatureGridSectionNode(
  node: LexicalNode | null | undefined,
): node is FeatureGridSectionNode {
  return node instanceof FeatureGridSectionNode;
}

function FeatureGridSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: FeatureGridSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isFeatureGridSectionNode,
  );

  const setFeatureCount = (count: number) => {
    const next = Math.min(3, Math.max(1, count));
    const features = [...data.features];
    while (features.length < next) {
      features.push({
        icon: "ruler",
        title: "Feature",
        body: "",
      });
    }
    update({ features: features.slice(0, next) });
  };

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="feature-grid"
    >
      <BlockDecoratorToolbar label="Feature grid" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Feature grid"
        >
          <SectionOptionSelect
            label="Columns"
            value={data.features.length}
            onChange={(value) => setFeatureCount(Number(value) || 3)}
            options={[1, 2, 3].map((count) => ({
              value: count,
              label: `${count} feature${count === 1 ? "" : "s"}`,
            }))}
          />
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({ surface: value === "alt" ? "alt" : "default" })
            }
            options={[
              { value: "default", label: "Default band" },
              { value: "alt", label: "Alt band" },
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
          <div className="mb-14 max-w-2xl">
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(eyebrow) => update({ eyebrow })}
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              value={data.headline}
              onChange={(headline) => update({ headline })}
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase whitespace-pre-line"
            />
          </div>
          <FeatureGridSection data={data} gridOnly />
        </div>
      </section>
    </div>
  );
}
