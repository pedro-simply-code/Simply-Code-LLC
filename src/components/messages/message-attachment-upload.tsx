"use client";

import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { appToast } from "~/lib/app-toast";
import {
  MESSAGE_ATTACHMENT_ACCEPT,
  MESSAGE_ATTACHMENT_MAX_BYTES,
  MESSAGE_ATTACHMENT_MAX_COUNT,
  type MessageAttachment,
  isAllowedAttachmentMime,
} from "~/lib/message-attachments";
import { useUploadThing } from "~/lib/uploadthing";
import { discardMessageAttachmentUrl } from "~/server/messages/attachment-actions";

function uploadFileUrl(file: { url: string; ufsUrl?: string | null }) {
  return file.ufsUrl ?? file.url;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachmentUpload({
  hint = "Images, PDF, Word, Excel, TXT or CSV — up to 5 files, 8 MB each.",
}: {
  hint?: string;
}) {
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);

  const { startUpload, isUploading } = useUploadThing("messageAttachment", {
    onUploadError: (error) => {
      appToast.error(error.message || "Upload failed.");
    },
  });

  const removeAttachment = async (url: string) => {
    setAttachments((prev) => prev.filter((item) => item.url !== url));
    await discardMessageAttachmentUrl(url);
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const files = [...fileList];
    if (files.length === 0) return;

    const remaining = MESSAGE_ATTACHMENT_MAX_COUNT - attachments.length;
    if (remaining <= 0) {
      appToast.error(
        `You can attach up to ${MESSAGE_ATTACHMENT_MAX_COUNT} files.`,
      );
      return;
    }

    const batch = files.slice(0, remaining);
    for (const file of batch) {
      if (!isAllowedAttachmentMime(file.type)) {
        appToast.error(`"${file.name}" is not an allowed file type.`);
        return;
      }
      if (file.size > MESSAGE_ATTACHMENT_MAX_BYTES) {
        appToast.error(`"${file.name}" is larger than 8 MB.`);
        return;
      }
    }

    try {
      const uploaded = await startUpload(batch);
      if (!uploaded?.length) {
        appToast.error("Upload failed. Try again.");
        return;
      }

      const next: MessageAttachment[] = [];
      for (const file of uploaded) {
        const contentType = file.type || "application/octet-stream";
        if (!isAllowedAttachmentMime(contentType)) {
          const url = uploadFileUrl(file);
          await discardMessageAttachmentUrl(url);
          appToast.error("One or more files were rejected after upload.");
          continue;
        }
        const item: MessageAttachment = {
          url: uploadFileUrl(file),
          name: file.name,
          size: file.size,
          contentType,
        };
        next.push(item);
      }

      if (next.length) {
        setAttachments((prev) =>
          [...prev, ...next].slice(0, MESSAGE_ATTACHMENT_MAX_COUNT),
        );
      }
    } catch {
      appToast.error("Upload failed. Try again.");
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name="attachmentsJson"
        value={JSON.stringify(attachments)}
        readOnly
      />
      <input
        type="file"
        id="message-attachment-input"
        className="sr-only"
        multiple
        accept={MESSAGE_ATTACHMENT_ACCEPT}
        disabled={
          isUploading || attachments.length >= MESSAGE_ATTACHMENT_MAX_COUNT
        }
        onChange={(event) => {
          const list = event.target.files;
          if (list?.length) void addFiles(list);
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={
            isUploading || attachments.length >= MESSAGE_ATTACHMENT_MAX_COUNT
          }
          onClick={() =>
            document.getElementById("message-attachment-input")?.click()
          }
          className="hover:border-sc-accent hover:text-sc-accent inline-flex items-center gap-2 rounded-md border border-[#15130f]/15 bg-white px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip className="size-3.5" />
          {isUploading ? "Uploading…" : "Add files"}
        </button>
        <span className="text-[11px] text-[#6f6a60]">{hint}</span>
      </div>

      {attachments.length > 0 ? (
        <ul className="bg-sc-section-alt/30 space-y-2 rounded-md border border-[#15130f]/10 p-3">
          {attachments.map((file) => (
            <li
              key={file.url}
              className="flex items-center justify-between gap-2 text-xs text-[#57524a]"
            >
              <span className="min-w-0 truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-[#9a9488]">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded p-1 hover:bg-white hover:text-[#9a3b2e]"
                onClick={() => void removeAttachment(file.url)}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
