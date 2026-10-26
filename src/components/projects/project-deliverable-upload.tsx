"use client";

import { useState } from "react";
import { useUploadThing } from "~/lib/uploadthing";
import type { MessageAttachment } from "~/lib/message-attachments";
import { MESSAGE_ATTACHMENT_ACCEPT } from "~/lib/message-attachments";
import { appGhostButton } from "~/lib/surface";

export function ProjectDeliverableUpload({
  projectId,
  onChange,
}: {
  projectId: string;
  onChange: (file: MessageAttachment | null) => void;
}) {
  const [file, setFile] = useState<MessageAttachment | null>(null);

  const { startUpload, isUploading } = useUploadThing("projectDeliverable", {
    onClientUploadComplete: (res) => {
      const uploaded = res[0];
      if (!uploaded?.url) return;
      const next: MessageAttachment = {
        url: uploaded.url,
        name: uploaded.name,
        size: uploaded.size,
        contentType: uploaded.type ?? "application/octet-stream",
      };
      setFile(next);
      onChange(next);
    },
  });

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={MESSAGE_ATTACHMENT_ACCEPT}
        className="hover:file:bg-sc-accent block w-full text-sm text-[#57524a] file:mr-3 file:rounded-md file:border-0 file:bg-[#15130f] file:px-3 file:py-2 file:text-[10px] file:font-bold file:tracking-[0.12em] file:text-white file:uppercase"
        disabled={isUploading}
        onChange={(event) => {
          const selected = event.target.files;
          if (!selected?.length) return;
          void startUpload(Array.from(selected), { projectId });
        }}
      />
      {isUploading ? (
        <p className="text-xs text-[#6f6a60]">Uploading…</p>
      ) : file ? (
        <p className="text-xs text-[#2e7d32]">Ready: {file.name}</p>
      ) : (
        <p className="text-xs text-[#6f6a60]">
          PDF, images, Office docs, up to 8MB.
        </p>
      )}
      {file ? (
        <button
          type="button"
          className={appGhostButton}
          onClick={() => {
            setFile(null);
            onChange(null);
          }}
        >
          Clear file
        </button>
      ) : null}
    </div>
  );
}
