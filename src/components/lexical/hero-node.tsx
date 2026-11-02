"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { useState, type ReactElement } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { HeroSection } from "~/components/content/hero-section";
import { StudioInput, StudioTextarea } from "~/components/studio/ui";
import {
  DEFAULT_HERO,
  HERO_NODE_TYPE,
  normalizeHeroData,
  type HeroData,
  type HeroStat,
} from "~/lib/content";
import { appPrimaryButtonStudioSm, appOutlineButton } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type SerializedHeroNode = Spread<
  { data: HeroData },
  SerializedLexicalNode
>;

/**
 * Editable hero section. The block is stored as a decorator node: the editor
 * shows form controls plus a live preview, while the public renderer reads the
 * same `data` payload with `HeroSection`.
 */
export class HeroNode extends DecoratorNode<ReactElement> {
  __data: HeroData;

  static getType(): string {
    return HERO_NODE_TYPE;
  }

  static clone(node: HeroNode): HeroNode {
    return new HeroNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedHeroNode): HeroNode {
    return $createHeroNode(normalizeHeroData(serializedNode.data));
  }

  constructor(data?: HeroData, key?: NodeKey) {
    super(key);
    this.__data = normalizeHeroData(data);
  }

  exportJSON(): SerializedHeroNode {
    return {
      ...super.exportJSON(),
      type: HERO_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-hero-node";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }

  getData(): HeroData {
    return this.getLatest().__data;
  }

  setData(data: HeroData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <HeroBlockEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createHeroNode(data: HeroData = DEFAULT_HERO): HeroNode {
  return $applyNodeReplacement(new HeroNode(data));
}

export function $isHeroNode(
  node: LexicalNode | null | undefined,
): node is HeroNode {
  return node instanceof HeroNode;
}

function HeroField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sc-ink mb-1.5 block text-[10px] font-bold tracking-[0.14em] uppercase">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-[#6f6a60]">{hint}</span>
      ) : null}
    </label>
  );
}

function HeroBlockEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: HeroData;
}) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(true);

  const update = (patch: Partial<HeroData>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHeroNode(node)) node.setData({ ...node.getData(), ...patch });
    });
  };

  const updateStat = (index: number, patch: Partial<HeroStat>) => {
    const stats = data.stats.map((stat, statIndex) =>
      statIndex === index ? { ...stat, ...patch } : stat,
    );
    update({ stats });
  };

  const remove = () => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  };

  return (
    <div
      contentEditable={false}
      className="my-8 overflow-hidden rounded-lg border border-[#15130f]/15 bg-white shadow-[0_1px_2px_rgba(21,19,15,0.06)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#15130f] px-3 py-2 text-white">
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase">
          Hero section
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors hover:bg-white/10"
          >
            {open ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {open ? "Hide settings" : "Edit settings"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      </div>

      {open ? (
        <div className="grid gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <HeroField label="Eyebrow">
              <StudioInput
                value={data.eyebrow}
                onChange={(event) => update({ eyebrow: event.target.value })}
              />
            </HeroField>
            <HeroField label="Badge / year">
              <StudioInput
                value={data.badge}
                onChange={(event) => update({ badge: event.target.value })}
              />
            </HeroField>
            <HeroField
              label="Headline"
              hint="Use the highlight field to pick the accent phrase."
              className="md:col-span-2"
            >
              <StudioTextarea
                value={data.headline}
                className="min-h-16"
                onChange={(event) => update({ headline: event.target.value })}
              />
            </HeroField>
            <HeroField label="Highlight phrase">
              <StudioInput
                value={data.highlight}
                onChange={(event) => update({ highlight: event.target.value })}
              />
            </HeroField>
            <HeroField label="Panel text">
              <StudioInput
                value={data.panelText}
                onChange={(event) => update({ panelText: event.target.value })}
              />
            </HeroField>
            <HeroField label="Description" className="md:col-span-2">
              <StudioTextarea
                value={data.description}
                className="min-h-20"
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </HeroField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HeroField label="Primary label">
              <StudioInput
                value={data.primaryLabel}
                onChange={(event) =>
                  update({ primaryLabel: event.target.value })
                }
              />
            </HeroField>
            <HeroField label="Primary link">
              <StudioInput
                value={data.primaryHref}
                onChange={(event) =>
                  update({ primaryHref: event.target.value })
                }
              />
            </HeroField>
            <HeroField label="Secondary label">
              <StudioInput
                value={data.secondaryLabel}
                onChange={(event) =>
                  update({ secondaryLabel: event.target.value })
                }
              />
            </HeroField>
            <HeroField label="Secondary link">
              <StudioInput
                value={data.secondaryHref}
                onChange={(event) =>
                  update({ secondaryHref: event.target.value })
                }
              />
            </HeroField>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sc-ink text-[10px] font-bold tracking-[0.14em] uppercase">
                Stats
              </span>
              <button
                type="button"
                onClick={() =>
                  update({ stats: [...data.stats, { value: "", label: "" }] })
                }
                className={cn(appOutlineButton, "gap-1 px-2 py-1")}
              >
                <Plus className="size-3.5" /> Add stat
              </button>
            </div>
            {data.stats.length === 0 ? (
              <p className="text-xs text-[#6f6a60]">
                No stats yet. The right-hand panel hides the grid when empty.
              </p>
            ) : (
              <div className="grid gap-2">
                {data.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2"
                  >
                    <StudioInput
                      value={stat.value}
                      placeholder="10+"
                      onChange={(event) =>
                        updateStat(index, { value: event.target.value })
                      }
                    />
                    <StudioInput
                      value={stat.label}
                      placeholder="Years building"
                      onChange={(event) =>
                        updateStat(index, { label: event.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          stats: data.stats.filter(
                            (_, statIndex) => statIndex !== index,
                          ),
                        })
                      }
                      aria-label="Remove stat"
                      className={cn(appPrimaryButtonStudioSm, "px-2")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none border-t border-[#15130f]/10 bg-white">
        <HeroSection data={data} className="border-b-0" />
      </div>
    </div>
  );
}
