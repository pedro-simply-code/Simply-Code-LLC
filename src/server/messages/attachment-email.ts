import type { MessageAttachment } from "~/lib/message-attachments";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function attachmentsHtmlBlock(attachments: MessageAttachment[]): string {
  if (!attachments.length) return "";
  const items = attachments
    .map(
      (file) =>
        `<li><a href="${escapeHtml(file.url)}">${escapeHtml(file.name)}</a> (${escapeHtml(file.contentType)})</li>`,
    )
    .join("");
  return `<p><strong>Attachments:</strong></p><ul>${items}</ul>`;
}
