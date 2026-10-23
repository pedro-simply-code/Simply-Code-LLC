import Image from "next/image";
import { FileText } from "lucide-react";
import type { MessageAttachment } from "~/lib/message-attachments";
import { isImageAttachment } from "~/lib/message-attachments";
import { cn } from "~/lib/utils";

export function MessageAttachmentsList({
  attachments,
  variant = "incoming",
}: {
  attachments: MessageAttachment[];
  variant?: "incoming" | "outgoing";
}) {
  if (!attachments.length) return null;

  const linkClass =
    variant === "outgoing"
      ? "text-white/90 underline underline-offset-2 hover:text-white"
      : "text-sc-ink underline underline-offset-2 hover:text-sc-accent";

  return (
    <ul className="mt-3 flex flex-col gap-2 border-t border-current/10 pt-3">
      {attachments.map((file) => (
        <li key={file.url}>
          {isImageAttachment(file.contentType) ? (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md ring-1 ring-[#15130f]/10"
            >
              <Image
                src={file.url}
                alt={file.name}
                width={320}
                height={200}
                className="max-h-48 w-auto object-contain bg-white/10"
                unoptimized
              />
            </a>
          ) : (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("inline-flex items-center gap-2 text-xs font-medium", linkClass)}
            >
              <FileText className="size-4 shrink-0 opacity-80" />
              <span className="truncate">{file.name}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
