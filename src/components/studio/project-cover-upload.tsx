"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

function assignFileToInput(input: HTMLInputElement | null, file: File | null) {
  if (!input) return;
  const dt = new DataTransfer();
  if (file) dt.items.add(file);
  input.files = dt.files;
}

export function ProjectCoverUpload({ defaultUrl }: { defaultUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);

  const [savedUrl, setSavedUrl] = useState(defaultUrl?.trim() ?? "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [hasPendingFile, setHasPendingFile] = useState(false);

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setLocalPreview(null);
  };

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be 8MB or smaller.");
      return;
    }

    clearLocalPreview();
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalPreview(objectUrl);
    setHasPendingFile(true);
    assignFileToInput(inputRef.current, file);
  };

  const removeCover = () => {
    clearLocalPreview();
    setHasPendingFile(false);
    setSavedUrl("");
    assignFileToInput(inputRef.current, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewSrc = localPreview || savedUrl || null;
  const showLegacyNote =
    Boolean(defaultUrl?.startsWith("/")) && savedUrl === defaultUrl?.trim() && !hasPendingFile;

  return (
    <div className="space-y-4">
      <input type="hidden" name="image" value={hasPendingFile ? "" : savedUrl} />
      <input
        ref={inputRef}
        type="file"
        name="coverFile"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) applyFile(file);
        }}
      />

      <div
        className="relative aspect-[1000/560] overflow-hidden border border-[#15130f]/15 bg-[#f7f4ee]"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) applyFile(file);
        }}
      >
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt="Project cover preview"
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
            unoptimized={previewSrc.startsWith("blob:") || previewSrc.startsWith("/")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-[#9a9488]">
            <Upload className="size-8 opacity-40" />
            <p className="text-xs font-semibold tracking-wide uppercase">No cover yet</p>
            <p className="text-[11px]">Choose or drop an image</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
        >
          {previewSrc ? "Choose another image" : "Choose image"}
        </button>
        {previewSrc ? (
          <button
            type="button"
            onClick={removeCover}
            className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#9a3b2e] hover:text-[#9a3b2e]"
          >
            Remove cover
          </button>
        ) : null}
        {hasPendingFile ? (
          <span className="text-[10px] font-bold tracking-[0.1em] text-[#b8770a] uppercase">
            Unsaved
          </span>
        ) : savedUrl ? (
          <span className="text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase">
            Saved
          </span>
        ) : null}
      </div>

      {showLegacyNote ? (
        <p className="text-[11px] leading-relaxed text-[#9a9488]">
          This project uses an older static image. Choose a new file and save to replace it.
        </p>
      ) : null}
    </div>
  );
}
