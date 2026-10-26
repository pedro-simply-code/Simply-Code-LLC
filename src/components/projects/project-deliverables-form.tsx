"use client";

import { useState } from "react";
import type { MessageAttachment } from "~/lib/message-attachments";
import { ProjectDeliverableUpload } from "~/components/projects/project-deliverable-upload";
import {
  Field,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";

export function ProjectDeliverablesForm({
  projectId,
  action,
  canPublishToClient,
}: {
  projectId: string;
  action: (formData: FormData) => void;
  canPublishToClient: boolean;
}) {
  const [file, setFile] = useState<MessageAttachment | null>(null);

  return (
    <form
      action={action}
      className="mt-4 space-y-3 border-t border-[#15130f]/10 pt-4"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="hidden"
        name="attachmentsJson"
        value={file ? JSON.stringify([file]) : ""}
      />
      <Field label="Title">
        <StudioInput name="title" required />
      </Field>
      <Field label="Description (optional)">
        <StudioTextarea name="description" />
      </Field>
      <Field label="File">
        <ProjectDeliverableUpload projectId={projectId} onChange={setFile} />
      </Field>
      <Field label="Visibility">
        <StudioSelect name="visibility" defaultValue="client">
          <option value="client">Client (portal)</option>
          <option value="internal">Internal only</option>
        </StudioSelect>
      </Field>
      {!canPublishToClient ? (
        <p className="text-[11px] text-[#6f6a60]">
          Client-visible deliverables require a project lead or founder. Use
          internal or ask your lead to publish.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!file}
        className="hover:bg-sc-accent rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase disabled:opacity-50"
      >
        Add deliverable
      </button>
    </form>
  );
}
