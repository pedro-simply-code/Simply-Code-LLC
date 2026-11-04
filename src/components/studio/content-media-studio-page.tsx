"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Loader2, Trash2 } from "lucide-react";
import { useContentMediaUpload } from "~/components/content/use-content-media-upload";
import { MediaLibrary } from "~/components/studio/media-library";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { contentPublicPath } from "~/lib/content";
import { appToast } from "~/lib/app-toast";
import { userProfileImageUnoptimized } from "~/lib/project-image";
import { studioContentPanel } from "~/lib/studio-content-surface";
import { appGhostButtonLg, appOutlineButton, appPrimaryButtonStudio } from "~/lib/surface";
import { cn } from "~/lib/utils";
import {
  deleteContentMedia,
  getContentMediaUsages,
  type ContentMediaUsage,
} from "~/server/studio/media";

function formatContentMediaUsagePlaces(
  places: ("cover" | "body")[],
): string {
  const labels: string[] = [];
  if (places.includes("cover")) labels.push("cover image");
  if (places.includes("body")) labels.push("page/post body");
  return labels.join(" and ");
}

function fileNameFromUrl(url: string): string {
  try {
    const segment = new URL(url).pathname.split("/").pop();
    if (!segment) return "Image";
    return decodeURIComponent(segment);
  } catch {
    return "Image";
  }
}

export function ContentMediaStudioPage() {
  const [selectedUrl, setSelectedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [usages, setUsages] = useState<ContentMediaUsage[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { uploadContentMediaFile, isUploading } = useContentMediaUpload();

  useEffect(() => {
    if (!selectedUrl) {
      setUsages([]);
      return;
    }

    let cancelled = false;
    setUsagesLoading(true);
    getContentMediaUsages(selectedUrl)
      .then((rows) => {
        if (!cancelled) setUsages(rows);
      })
      .catch(() => {
        if (!cancelled) setUsages([]);
      })
      .finally(() => {
        if (!cancelled) setUsagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUrl]);

  const copyUrl = async () => {
    if (!selectedUrl) return;
    try {
      await navigator.clipboard.writeText(selectedUrl);
      setCopied(true);
      appToast.success("URL copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      appToast.error("Could not copy URL.");
    }
  };

  const confirmDelete = () => {
    if (!selectedUrl || usages.length > 0) return;

    startTransition(async () => {
      const result = await deleteContentMedia(selectedUrl);
      if (result.ok) {
        appToast.success("Image deleted.");
        setDeleteOpen(false);
        setSelectedUrl("");
        setRefreshSignal((value) => value + 1);
        return;
      }
      setDeleteOpen(false);
      if (result.reason === "in-use" && result.usages?.length) {
        setUsages(result.usages);
        appToast.error("Image is still in use. Update those entries first.");
        return;
      }
      appToast.error("Could not delete this image.");
    });
  };

  const canDelete = selectedUrl && !usagesLoading && usages.length === 0;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1">
      <div
        className={cn(
          studioContentPanel,
          "flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-4 sm:p-5",
        )}
      >
        <MediaLibrary
          selectedUrl={selectedUrl}
          onSelect={setSelectedUrl}
          uploadFile={uploadContentMediaFile}
          isUploading={isUploading}
          selectOnUpload={false}
          thumbnailGrid="compact"
          fillHeight
          refreshSignal={refreshSignal}
          className="min-h-0 flex-1"
        />
      </div>

      <aside
        className={cn(
          studioContentPanel,
          "flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-4 sm:p-5",
        )}
      >
        <p className="shrink-0 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
          Selected file
        </p>
        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {selectedUrl ? (
          <>
            <div className="relative aspect-video max-h-[40%] shrink-0 overflow-hidden rounded-md bg-[#f0f0f1] ring-1 ring-[#15130f]/10">
              <Image
                src={selectedUrl}
                alt=""
                fill
                sizes="320px"
                unoptimized={userProfileImageUnoptimized(selectedUrl)}
                className="object-contain"
              />
            </div>
            <p className="mt-3 line-clamp-2 break-all text-sm font-semibold text-[#15130f]">
              {fileNameFromUrl(selectedUrl)}
            </p>
            <p className="mt-2 line-clamp-2 break-all font-mono text-[11px] leading-snug text-[#57524a]">
              {selectedUrl}
            </p>

            {usagesLoading ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-[#6f6a60]">
                <Loader2 className="size-3.5 animate-spin" />
                Checking usage…
              </p>
            ) : usages.length > 0 ? (
              <div className="mt-4 rounded-md border border-[#15130f]/10 bg-[#f6f7f7]/80 p-3">
                <p className="text-xs font-semibold text-[#15130f]">
                  In use — replace the image in these entries before deleting:
                </p>
                <ul className="mt-2 space-y-2">
                  {usages.map((usage) => (
                    <li key={usage.entryId} className="text-xs text-[#57524a]">
                      <Link
                        href={`/studio/content/${usage.entryId}`}
                        className="text-sc-accent font-semibold hover:underline"
                      >
                        {usage.title}
                      </Link>
                      <span className="text-[#9a9488]">
                        {" "}
                        · {usage.kind === "post" ? "Post" : "Page"} ·{" "}
                        {formatContentMediaUsagePlaces(usage.places)}
                      </span>
                      <p className="mt-0.5 font-mono text-[10px] text-[#9a9488]">
                        {contentPublicPath(
                          usage.kind,
                          usage.slug,
                          usage.isHomepage,
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-xs text-[#6f6a60]">
                Not used in any cover or content body. You can delete it safely.
              </p>
            )}

            <div className="mt-4 grid shrink-0 gap-2">
              <button
                type="button"
                onClick={() => void copyUrl()}
                className={cn(
                  appGhostButtonLg,
                  "inline-flex w-full items-center justify-center gap-2",
                )}
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy URL"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={!canDelete || pending}
                title={
                  usages.length > 0
                    ? "Remove this image from all entries listed above first"
                    : "Delete from library"
                }
                className={cn(
                  appGhostButtonLg,
                  "inline-flex w-full items-center justify-center gap-2 border border-[#c62828]/25 text-[#b71c1c] hover:bg-[#ffebee]",
                  (!canDelete || pending) && "cursor-not-allowed opacity-50",
                )}
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Delete image
              </button>
            </div>
          </>
          ) : (
            <p className="text-sm leading-relaxed text-[#6f6a60]">
              Select an image from the library to preview it, copy its URL, or
              delete it when it is not used in content.
            </p>
          )}
        </div>
      </aside>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-0 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
              This removes{" "}
              <span className="font-semibold text-[#15130f]">
                {selectedUrl ? fileNameFromUrl(selectedUrl) : "this file"}
              </span>{" "}
              from the content media library and deletes the file from storage.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className={appOutlineButton}
              disabled={pending}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirmDelete}
              className={cn(
                appPrimaryButtonStudio,
                "inline-flex items-center justify-center gap-2 bg-[#b71c1c] hover:bg-[#c62828]",
              )}
            >
              {pending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete image"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
