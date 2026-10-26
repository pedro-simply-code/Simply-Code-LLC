import { z } from "zod";
import { isUploadThingImageUrl } from "~/lib/project-image";

export const MESSAGE_ATTACHMENT_MAX_COUNT = 5;
export const MESSAGE_ATTACHMENT_MAX_BYTES = 8 * 1024 * 1024;

/** Common images + PDF + Word/Excel + plain text/CSV */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
] as const;

export const MESSAGE_ATTACHMENT_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
].join(",");

const allowedMimeSet = new Set<string>(ALLOWED_ATTACHMENT_MIME_TYPES);

export type MessageAttachment = {
  url: string;
  name: string;
  size: number;
  contentType: string;
};

export const messageAttachmentSchema = z.object({
  url: z.string().url(),
  name: z.string().trim().min(1).max(255),
  size: z.number().int().positive().max(MESSAGE_ATTACHMENT_MAX_BYTES),
  contentType: z.string().trim().min(1).max(120),
});

export const messageAttachmentsSchema = z
  .array(messageAttachmentSchema)
  .max(MESSAGE_ATTACHMENT_MAX_COUNT);

export function isUploadThingFileUrl(url: string): boolean {
  return isUploadThingImageUrl(url);
}

export function isAllowedAttachmentMime(contentType: string): boolean {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return allowedMimeSet.has(base);
}

export function sanitizeMessageAttachments(
  value: unknown,
): MessageAttachment[] {
  const parsed = messageAttachmentsSchema.safeParse(value);
  if (!parsed.success) return [];

  return parsed.data.filter(
    (item) =>
      isUploadThingFileUrl(item.url) &&
      isAllowedAttachmentMime(item.contentType),
  );
}

export function parseMessageAttachmentsJson(raw: string): MessageAttachment[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    return sanitizeMessageAttachments(JSON.parse(trimmed));
  } catch {
    return [];
  }
}

export function parseMessageAttachmentsFromForm(
  formData: FormData,
): MessageAttachment[] {
  return parseMessageAttachmentsJson(
    String(formData.get("attachmentsJson") ?? ""),
  );
}

export function isImageAttachment(contentType: string): boolean {
  return contentType.startsWith("image/");
}
