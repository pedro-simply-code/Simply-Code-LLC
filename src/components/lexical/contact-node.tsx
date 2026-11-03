"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Link2, Settings2 } from "lucide-react";
import { type ReactElement } from "react";
import { ContactSection } from "~/components/content/contact-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "~/components/lexical/decorator-section-shared";
import { LinkUrlPopover } from "~/components/lexical/link-url-popover";
import {
  CONTACT_SECTION_NODE_TYPE,
  DEFAULT_CONTACT_SECTION,
  normalizeContactSectionData,
  type ContactSectionData,
} from "~/lib/homepage-sections";
import type { LinkFieldValue } from "~/lib/link-options";

export type SerializedContactSectionNode = Spread<
  { data: ContactSectionData },
  SerializedLexicalNode
>;

export class ContactSectionNode extends DecoratorNode<ReactElement> {
  __data: ContactSectionData;

  static getType(): string {
    return CONTACT_SECTION_NODE_TYPE;
  }

  static clone(node: ContactSectionNode): ContactSectionNode {
    return new ContactSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedContactSectionNode,
  ): ContactSectionNode {
    return $createContactSectionNode(
      normalizeContactSectionData(serializedNode.data),
    );
  }

  constructor(data?: ContactSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeContactSectionData(data);
  }

  exportJSON(): SerializedContactSectionNode {
    return {
      ...super.exportJSON(),
      type: CONTACT_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-contact-node";
    div.dataset.editorBlock = "contact";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): ContactSectionData {
    return this.getLatest().__data;
  }

  setData(data: ContactSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <ContactSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createContactSectionNode(
  data: ContactSectionData = DEFAULT_CONTACT_SECTION,
): ContactSectionNode {
  return $applyNodeReplacement(new ContactSectionNode(data));
}

export function $isContactSectionNode(
  node: LexicalNode | null | undefined,
): node is ContactSectionNode {
  return node instanceof ContactSectionNode;
}

function ContactSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: ContactSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isContactSectionNode,
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="contact"
    >
      <BlockDecoratorToolbar label="Contact" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Contact"
          description="Choose what appears in this band. Edit headings and copy on the canvas."
        >
          <SectionOptionCheckbox
            label="Show contact form"
            checked={data.showForm}
            onChange={(checked) => update({ showForm: checked })}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <ContactSection
        data={data}
        introOverride={
          <>
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(v) => update({ eyebrow: v })}
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              multiline
              value={data.headline}
              onChange={(v) => update({ headline: v })}
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.description}
              onChange={(v) => update({ description: v })}
              className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#57524a]"
            />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <InlineText
                value={data.faqLabel}
                onChange={(v) => update({ faqLabel: v })}
                className="text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4"
              />
              <LinkUrlPopover
                value={{
                  href: data.faqHref,
                  newTab: data.faqNewTab,
                  nofollow: false,
                }}
                onPrepare={() => ({
                  href: data.faqHref,
                  newTab: data.faqNewTab,
                  nofollow: false,
                })}
                onSave={(value: LinkFieldValue) =>
                  update({ faqHref: value.href, faqNewTab: value.newTab })
                }
                trigger={
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded border bg-white"
                    aria-label="Edit FAQ link"
                  >
                    <Link2 className="size-4" />
                  </button>
                }
              />
            </div>
          </>
        }
      />
    </div>
  );
}
