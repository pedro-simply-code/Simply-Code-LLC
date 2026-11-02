"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { StudioCard } from "~/components/studio/ui";
import { ContentFormHeader } from "~/components/content/content-form-header";
import { ContentFormSidebar } from "~/components/content/content-form-sidebar";
import { ContentCoverUpload } from "~/components/content/content-cover-field";
import type { ContentKindName, ContentStatusName } from "~/lib/content";
import {
  studioContentPanel,
  studioContentPanelMuted,
} from "~/lib/studio-content-surface";
import { appGhostButtonLg, appOutlineButton, appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";

function remountChild(node: ReactNode, remountKey: number) {
  if (isValidElement(node)) {
    return cloneElement(node, { key: `content-editor-${remountKey}` });
  }
  return node;
}

type ContentEditorWorkspaceProps = {
  header: {
    title?: string;
    slug?: string;
  };
  sidebar: {
    kind?: ContentKindName;
    status?: ContentStatusName;
    excerpt?: string;
    coverImageUrl?: string;
  };
  editor: ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  /** Edit mode: remount fields to last loaded saved values (not a server round-trip). */
  enableDiscard?: boolean;
  stickyExtra?: ReactNode;
};

export function ContentEditorWorkspace({
  header,
  sidebar,
  editor,
  submitLabel = "Save content",
  cancelHref,
  enableDiscard = false,
  stickyExtra,
}: ContentEditorWorkspaceProps) {
  const cardSurface = studioContentPanel;
  const [remountKey, setRemountKey] = useState(0);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [contentKind, setContentKind] = useState<ContentKindName>(
    sidebar.kind ?? "page",
  );

  const confirmDiscard = () => {
    setContentKind(sidebar.kind ?? "page");
    setRemountKey((key) => key + 1);
    setDiscardOpen(false);
  };

  return (
    <div className="space-y-6">
      <section
        key={`content-header-${remountKey}`}
        className={cn(studioContentPanel, "px-6 py-5 md:px-8 md:py-6")}
      >
        <ContentFormHeader
          title={header.title}
          slug={header.slug}
          kind={contentKind}
        />
      </section>

      <div
        className={cn(
          studioContentPanelMuted,
          "sticky top-20 z-10 -mx-1 flex flex-wrap items-center justify-end gap-3 px-3 py-3 backdrop-blur-sm",
        )}
      >
        {enableDiscard || stickyExtra ? (
          <div className="mr-auto flex flex-wrap items-center gap-3">
            {enableDiscard ? (
              <>
                <button
                  type="button"
                  onClick={() => setDiscardOpen(true)}
                  className={cn(appOutlineButton, "py-2.5")}
                >
                  Reset
                </button>
                <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
                  <DialogContent
                    className="max-w-md border-0 bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.14)]"
                    showCloseButton
                  >
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
                        Discard changes?
                      </DialogTitle>
                      <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
                        Unsaved edits to the title, body, cover, and publishing
                        fields will be removed. The form will show the last
                        saved version from when you opened this page.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDiscardOpen(false)}
                        className={appGhostButtonLg}
                      >
                        Keep editing
                      </button>
                      <button
                        type="button"
                        onClick={confirmDiscard}
                        className={cn(
                          appPrimaryButtonStudioSubmit,
                          "bg-[#9a3b2e] hover:bg-[#7a2f24]",
                        )}
                      >
                        Discard changes
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
            {stickyExtra}
          </div>
        ) : null}
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="site-control site-radius-md bg-sc-section px-4 py-2.5 text-[10px] font-bold tracking-[0.14em] text-sc-ink uppercase"
          >
            Cancel
          </Link>
        ) : null}
        <button type="submit" className={appPrimaryButtonStudioSubmit}>
          {submitLabel}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start">
        <StudioCard
          title="Body"
          description="Write the page or post. Use the toolbar to format text and insert blocks."
          padded={false}
        >
          {remountChild(editor, remountKey)}
        </StudioCard>

        <aside className="space-y-5 self-start lg:sticky lg:top-36">
          <StudioCard title="Cover" className={cardSurface}>
            <ContentCoverUpload
              key={`content-cover-${remountKey}`}
              defaultUrl={sidebar.coverImageUrl ?? ""}
            />
          </StudioCard>

          <StudioCard
            title="Publishing"
            description="Type, status, and excerpt."
            className={cardSurface}
          >
            <ContentFormSidebar
              key={`content-sidebar-${remountKey}`}
              kind={contentKind}
              status={sidebar.status}
              excerpt={sidebar.excerpt}
              onKindChange={setContentKind}
            />
          </StudioCard>
        </aside>
      </div>
    </div>
  );
}
