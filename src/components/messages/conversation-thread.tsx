import type { contactMessages } from "~/server/db/schema";
import { MessageAttachmentsList } from "~/components/messages/message-attachments-list";
import { sanitizeMessageAttachments } from "~/lib/message-attachments";
import type { ContactMessageReply } from "~/server/messages/queries";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

function channelLabel(channel: string) {
  switch (channel) {
    case "both":
      return "Portal & email";
    case "portal":
      return "Portal";
    case "email":
      return "Email";
    default:
      return channel;
  }
}

export function MessageConversationThread({
  enquiry,
  replies,
  viewer,
}: {
  enquiry: typeof contactMessages.$inferSelect;
  replies: ContactMessageReply[];
  viewer: "studio" | "client";
}) {
  const clientLabel = viewer === "client" ? "You" : enquiry.name;
  const enquiryAttachments = sanitizeMessageAttachments(enquiry.attachments);

  return (
    <div className={cn(appPanel, "flex flex-col gap-3 p-4 sm:p-5")}>
      <div className="flex justify-start">
        <div className="max-w-[min(100%,32rem)] rounded-2xl rounded-tl-sm border border-sc-accent/25 bg-sc-accent/8 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold tracking-[0.1em] text-sc-accent uppercase">
              {clientLabel}
            </p>
            <time className="text-[10px] text-[#9a9488]">
              {new Date(enquiry.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#57524a]">
            {enquiry.message}
          </p>
          <MessageAttachmentsList attachments={enquiryAttachments} variant="incoming" />
        </div>
      </div>

      {replies.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#6f6a60]">
          {viewer === "client"
            ? "No replies yet. We will respond here and by email when needed."
            : "No replies yet."}
        </p>
      ) : (
        replies.map((reply) => (
          <div key={reply.id} className="flex justify-end">
            <div className="max-w-[min(100%,32rem)] rounded-2xl rounded-tr-sm bg-[#15130f] px-4 py-3 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold tracking-[0.1em] text-white/80 uppercase">
                  {reply.sentByName ?? "Simply Code"}
                  <span className="font-normal text-white/55"> · {channelLabel(reply.channel)}</span>
                </p>
                <time className="text-[10px] text-white/55">
                  {new Date(reply.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white/95">
                {reply.body}
              </p>
              <MessageAttachmentsList attachments={reply.attachments} variant="outgoing" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
