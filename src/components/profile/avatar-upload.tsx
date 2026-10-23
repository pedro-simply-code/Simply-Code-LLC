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

export function AvatarUpload({ defaultUrl }: { defaultUrl?: string | null }) {
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
    return () => clearLocalPreview();
  }, []);

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4 MB or smaller.");
      return;
    }
    clearLocalPreview();
    const preview = URL.createObjectURL(file);
    localPreviewRef.current = preview;
    setLocalPreview(preview);
    setHasPendingFile(true);
    assignFileToInput(inputRef.current, file);
  };

  const removeAvatar = () => {
    clearLocalPreview();
    setHasPendingFile(false);
    setSavedUrl("");
    assignFileToInput(inputRef.current, null);
  };

  const previewSrc = localPreview || savedUrl || null;

  return (
    <div className="space-y-4">
      <input type="hidden" name="image" value={hasPendingFile ? "" : savedUrl} />
      <input
        ref={inputRef}
        type="file"
        name="avatarFile"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) applyFile(file);
        }}
      />

      <div className="flex flex-wrap items-center gap-5">
        <div
          className="relative size-28 shrink-0 overflow-hidden rounded-full border border-[#15130f]/15 bg-gradient-to-br from-[#f0a500] to-[#e2761b]"
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
              alt="Profile photo preview"
              fill
              sizes="112px"
              className="object-cover"
              unoptimized={previewSrc.startsWith("blob:")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#15130f]/50">
              <Upload className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
          >
            {previewSrc ? "Choose another" : "Upload photo"}
          </button>
          {previewSrc ? (
            <button
              type="button"
              onClick={removeAvatar}
              className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#9a3b2e] hover:text-[#9a3b2e]"
            >
              Remove
            </button>
          ) : null}
          {hasPendingFile ? (
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#b8770a] uppercase">
              Unsaved
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
