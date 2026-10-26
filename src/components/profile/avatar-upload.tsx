"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { appToast } from "~/lib/app-toast";
import { isUploadThingImageUrl } from "~/lib/project-image";
import { useUploadThing } from "~/lib/uploadthing";
import { discardPendingAvatarUpload } from "~/server/profile/actions";

function uploadFileUrl(file: { url: string; ufsUrl?: string | null }) {
  return file.ufsUrl ?? file.url;
}

export function AvatarUpload({ defaultUrl }: { defaultUrl?: string | null }) {
  const initialUrl = defaultUrl?.trim() ?? "";
  const pendingUtUrlRef = useRef<string | null>(null);
  const localPreviewRef = useRef<string | null>(null);

  const [dbUrl] = useState(initialUrl);
  const [imageValue, setImageValue] = useState(initialUrl);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setLocalPreview(null);
  };

  const { startUpload, isUploading } = useUploadThing("avatar", {
    onUploadError: (error) => {
      clearLocalPreview();
      appToast.error(error.message || "Upload failed.");
    },
  });

  useEffect(() => {
    const savedUrl = dbUrl;
    return () => {
      clearLocalPreview();
      const pending = pendingUtUrlRef.current;
      if (pending && pending !== savedUrl) {
        void discardPendingAvatarUpload(pending);
      }
    };
  }, [dbUrl]);

  const discardPending = async (url: string) => {
    if (!isUploadThingImageUrl(url)) return;
    await discardPendingAvatarUpload(url);
  };

  const applyFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      appToast.error("Please choose an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      appToast.error("Image must be 4 MB or smaller.");
      return;
    }

    clearLocalPreview();
    const blob = URL.createObjectURL(file);
    localPreviewRef.current = blob;
    setLocalPreview(blob);

    const previousPending = pendingUtUrlRef.current;
    if (previousPending) {
      await discardPending(previousPending);
      pendingUtUrlRef.current = null;
    }

    try {
      const uploaded = await startUpload([file]);
      clearLocalPreview();

      if (!uploaded?.[0]) {
        appToast.error("Upload failed. Try again.");
        setImageValue(dbUrl);
        return;
      }

      const url = uploadFileUrl(uploaded[0]);
      pendingUtUrlRef.current = url;
      setImageValue(url);
    } catch {
      clearLocalPreview();
      setImageValue(dbUrl);
    }
  };

  const removeAvatar = async () => {
    clearLocalPreview();
    if (pendingUtUrlRef.current) {
      await discardPending(pendingUtUrlRef.current);
      pendingUtUrlRef.current = null;
    }
    setImageValue("");
  };

  const previewSrc = localPreview || imageValue || null;
  const isUnsaved = imageValue !== dbUrl;

  return (
    <div className="space-y-4">
      <input type="hidden" name="image" value={imageValue} />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void applyFile(file);
          event.target.value = "";
        }}
        id="avatar-file-input"
      />

      <div className="flex flex-wrap items-center gap-5">
        <div
          className="from-sc-accent-bright to-sc-accent relative size-28 shrink-0 overflow-hidden rounded-full bg-gradient-to-br shadow-[0_2px_12px_rgba(21,19,15,0.12)] ring-2 ring-white"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) void applyFile(file);
          }}
        >
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt="Profile photo preview"
              fill
              sizes="112px"
              className="object-cover"
              unoptimized={
                previewSrc.startsWith("blob:") || previewSrc.startsWith("/")
              }
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
            disabled={isUploading}
            onClick={() =>
              document.getElementById("avatar-file-input")?.click()
            }
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase disabled:opacity-60"
          >
            {isUploading
              ? "Uploading…"
              : previewSrc
                ? "Choose another"
                : "Upload photo"}
          </button>
          {previewSrc ? (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => void removeAvatar()}
              className="rounded-md bg-white px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase shadow-[0_1px_2px_rgba(21,19,15,0.08)] hover:text-[#9a3b2e] hover:shadow-[0_2px_8px_rgba(154,59,46,0.12)] disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
          {isUploading ? (
            <span className="text-sc-muted text-[10px] font-bold tracking-[0.1em] uppercase">
              Uploading to storage…
            </span>
          ) : isUnsaved ? (
            <span className="text-sc-accent text-[10px] font-bold tracking-[0.1em] uppercase">
              Unsaved — save profile to apply
            </span>
          ) : imageValue ? (
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase">
              Saved
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
