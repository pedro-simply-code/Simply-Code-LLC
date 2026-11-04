"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { Check, Copy, ImagePlus, Loader2, Upload } from "lucide-react";
import { appToast } from "~/lib/app-toast";
import {
  CONTENT_MEDIA_ACCEPT,
  contentMediaFileError,
} from "~/lib/media-library";
import { userProfileImageUnoptimized } from "~/lib/project-image";
import { listStudioMedia, type StudioMediaItem } from "~/server/studio/media";
import { cn } from "~/lib/utils";
import { appGhostButtonLg } from "~/lib/surface";

type MediaLibraryProps = {
  selectedUrl?: string;
  onSelect: (url: string) => void;
  /** Shared content-media uploader from the parent (one UploadThing client). */
  uploadFile?: (file: File) => Promise<string | null>;
  isUploading?: boolean;
  /** When true, the last uploaded file becomes the current selection (does not apply the cover). */
  selectOnUpload?: boolean;
  /** Increment to reload the grid after deletes elsewhere. */
  refreshSignal?: number;
  variant?: "default" | "overlay";
  /** Denser grid on the full-page media library. */
  thumbnailGrid?: "default" | "compact";
  /** Fill parent height; grid scrolls inside (studio media page). */
  fillHeight?: boolean;
  className?: string;
};

function filesFromDataTransfer(data: DataTransfer): File[] {
  return [...data.files].filter((file) => file.type.startsWith("image/"));
}

export function MediaLibrary({
  selectedUrl = "",
  onSelect,
  uploadFile,
  isUploading = false,
  selectOnUpload = true,
  refreshSignal = 0,
  variant = "default",
  thumbnailGrid = "default",
  fillHeight = false,
  className,
}: MediaLibraryProps) {
  const isOverlay = variant === "overlay";
  const compactThumbs = !isOverlay && thumbnailGrid === "compact";
  const useFillLayout = fillHeight && !isOverlay;
  const inputId = useId();
  const [items, setItems] = useState<StudioMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);

  const busy = isUploading || batchBusy;

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const rows = await listStudioMedia();
      setItems(rows);
    } catch {
      setItems([]);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFiles = useCallback(
    async (rawFiles: File[]) => {
      if (!uploadFile || rawFiles.length === 0) return;

      const files: File[] = [];
      for (const file of rawFiles) {
        const error = contentMediaFileError(file);
        if (error) {
          appToast.error(error);
          continue;
        }
        files.push(file);
      }
      if (files.length === 0) return;

      setBatchBusy(true);
      let lastUrl: string | null = null;
      try {
        for (const file of files) {
          const url = await uploadFile(file);
          if (url) lastUrl = url;
        }
        await refresh();
        if (selectOnUpload && lastUrl) {
          onSelect(lastUrl);
        }
        if (files.length > 1) {
          appToast.success(`${files.length} images added to library.`);
        } else if (lastUrl) {
          appToast.success("Image added to library.");
        }
      } finally {
        setBatchBusy(false);
      }
    },
    [onSelect, refresh, selectOnUpload, uploadFile],
  );

  const onFilePick = async (fileList: FileList | null | undefined) => {
    if (!fileList?.length) return;
    await uploadFiles([...fileList]);
  };

  useEffect(() => {
    let cancelled = false;
    listStudioMedia()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  const dropZone = (
    <div
      className={cn(
        "relative rounded-md border-2 border-dashed transition-colors",
        dragActive
          ? "border-sc-accent bg-sc-accent/8"
          : "border-[#15130f]/15 bg-[#f6f7f7]/80 hover:border-[#15130f]/25",
        busy && "pointer-events-none opacity-70",
        !uploadFile && "opacity-50",
        isOverlay ? "shrink-0" : "",
      )}
    >
      <label
        htmlFor={uploadFile && !busy ? inputId : undefined}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 px-4 text-center",
          isOverlay ? "min-h-[88px] py-4" : "min-h-[120px] py-6",
          (!uploadFile || busy) && "cursor-default",
        )}
      >
        {busy ? (
          <>
            <Loader2 className="text-sc-accent size-8 animate-spin" />
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#57524a] uppercase">
              Uploading…
            </p>
          </>
        ) : (
          <>
            <Upload
              className={cn(
                isOverlay ? "size-7" : "size-9",
                dragActive ? "text-sc-accent" : "text-sc-accent/50",
              )}
            />
            <p className="text-sm font-semibold text-[#15130f]">
              {dragActive ? "Drop files to upload" : "Drop files here"}
            </p>
            <p className="text-xs leading-relaxed text-[#6f6a60]">
              or select files · PNG, JPG, WebP, GIF · up to 8 MB
            </p>
          </>
        )}
      </label>
    </div>
  );

  const toolbar = (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <label
        htmlFor={inputId}
        className={cn(
          appGhostButtonLg,
          "inline-flex cursor-pointer items-center gap-2",
          (busy || !uploadFile) && "pointer-events-none opacity-60",
        )}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ImagePlus className="size-3.5" />
        )}
        {busy ? "Uploading…" : "Select files"}
      </label>
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={loading && !loadFailed}
        className="text-[10px] font-bold tracking-[0.12em] text-[#6f6a60] uppercase hover:text-[#15130f] disabled:opacity-50"
      >
        Refresh
      </button>
      {items.length > 0 ? (
        <span className="text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase">
          {items.length} items
        </span>
      ) : null}
    </div>
  );

  const grid = loading ? (
    <p className="text-xs text-[#6f6a60]">Loading library…</p>
  ) : loadFailed ? (
    <p className="text-xs text-[#6f6a60]">
      Library could not be loaded. Try Refresh, or upload a new image.
    </p>
  ) : items.length === 0 ? (
    <p className="text-xs text-[#6f6a60]">
      No images yet. Drop files above or use Select files.
    </p>
  ) : (
    <ul
      className={cn(
        "grid",
        compactThumbs
          ? "grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
          : cn(
              "gap-2",
              isOverlay
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5",
            ),
      )}
    >
      {items.map((item) => {
        const active = selectedUrl === item.url;
        return (
          <li key={item.url}>
            <button
              type="button"
              onClick={() => onSelect(item.url)}
              className={cn(
                "group relative aspect-square w-full overflow-hidden rounded-sm bg-[#f0f0f1] ring-1 ring-[#15130f]/10 transition-shadow hover:ring-[#15130f]/25",
                active &&
                  "ring-sc-accent ring-2 ring-offset-1 ring-offset-white",
                compactThumbs && active && "ring-offset-0",
              )}
            >
              <Image
                src={item.url}
                alt=""
                fill
                unoptimized={userProfileImageUnoptimized(item.url)}
                sizes={
                  compactThumbs
                    ? "(max-width: 640px) 15vw, (max-width: 1024px) 10vw, 120px"
                    : "(max-width: 768px) 25vw, 160px"
                }
                quality={90}
                className="object-cover"
              />
              {active ? (
                <span
                  className={cn(
                    "bg-sc-accent absolute flex items-center justify-center rounded-full text-white shadow-sm",
                    compactThumbs
                      ? "top-0.5 right-0.5 size-3.5"
                      : "top-1.5 right-1.5 size-5",
                  )}
                >
                  <Check
                    className={compactThumbs ? "size-2" : "size-3"}
                    strokeWidth={3}
                  />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className={cn(
        isOverlay
          ? "flex h-full min-h-[240px] flex-col gap-3"
          : useFillLayout
            ? "flex h-full min-h-0 flex-col gap-4"
            : "space-y-4",
        className,
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!uploadFile || busy) return;
        if ([...event.dataTransfer.types].includes("Files")) {
          setDragActive(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (uploadFile && !busy) event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (!uploadFile || busy) return;
        void uploadFiles(filesFromDataTransfer(event.dataTransfer));
      }}
    >
      <input
        id={inputId}
        type="file"
        accept={CONTENT_MEDIA_ACCEPT}
        multiple
        className="sr-only"
        disabled={busy || !uploadFile}
        onChange={(event) => {
          void onFilePick(event.target.files);
          event.target.value = "";
        }}
      />

      {dropZone}
      <div className={cn(useFillLayout && "shrink-0")}>{toolbar}</div>

      {isOverlay ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-1">{grid}</div>
      ) : useFillLayout ? (
        <div className="min-h-0 flex-1 overflow-y-auto">{grid}</div>
      ) : (
        grid
      )}
    </div>
  );
}
