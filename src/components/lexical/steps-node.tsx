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
import { StepsSection } from "~/components/content/steps-section";
import {
  BlockDecoratorToolbar,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import {
  DEFAULT_STEPS_SECTION,
  normalizeStepsSectionData,
  STEPS_SECTION_NODE_TYPE,
  type StepsSectionData,
} from "~/lib/site-page-sections";

export type SerializedStepsSectionNode = Spread<
  { data: StepsSectionData },
  SerializedLexicalNode
>;

export class StepsSectionNode extends DecoratorNode<ReactElement> {
  __data: StepsSectionData;

  static getType(): string {
    return STEPS_SECTION_NODE_TYPE;
  }

  static clone(node: StepsSectionNode): StepsSectionNode {
    return new StepsSectionNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedStepsSectionNode): StepsSectionNode {
    return $createStepsSectionNode(normalizeStepsSectionData(serializedNode.data));
  }

  constructor(data?: StepsSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeStepsSectionData(data);
  }

  exportJSON(): SerializedStepsSectionNode {
    return {
      ...super.exportJSON(),
      type: STEPS_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-steps-node";
    div.dataset.editorBlock = "steps";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): StepsSectionData {
    return this.getLatest().__data;
  }

  setData(data: StepsSectionData): this {
    const writable = this.getWritable();
    writable.__data = normalizeStepsSectionData(data);
    return writable;
  }

  decorate(): ReactElement {
    return <StepsSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createStepsSectionNode(
  data: StepsSectionData = DEFAULT_STEPS_SECTION,
): StepsSectionNode {
  return $applyNodeReplacement(new StepsSectionNode(data));
}

export function $isStepsSectionNode(
  node: LexicalNode | null | undefined,
): node is StepsSectionNode {
  return node instanceof StepsSectionNode;
}

function StepsSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: StepsSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isStepsSectionNode);

  const setStepCount = (count: number) => {
    const next = Math.min(4, Math.max(1, count));
    const steps = [...data.steps];
    while (steps.length < next) {
      steps.push({ title: "Step", body: "" });
    }
    update({ steps: steps.slice(0, next) });
  };

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="steps"
    >
      <BlockDecoratorToolbar label="Process steps" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Process steps"
        >
          <SectionOptionSelect
            label="Steps shown"
            value={data.steps.length}
            onChange={(value) => setStepCount(Number(value) || 4)}
            options={[1, 2, 3, 4].map((count) => ({
              value: count,
              label: `${count} step${count === 1 ? "" : "s"}`,
            }))}
          />
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({ surface: value === "default" ? "default" : "alt" })
            }
            options={[
              { value: "alt", label: "Alt band" },
              { value: "default", label: "Default band" },
            ]}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <StepsSection data={data} />
    </div>
  );
}
