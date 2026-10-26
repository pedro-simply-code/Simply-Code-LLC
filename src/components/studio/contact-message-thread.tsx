import type { contactMessages } from "~/server/db/schema";
import type { ContactMessageReply } from "~/server/messages/queries";
import { MessageConversationThread } from "~/components/messages/conversation-thread";

export function ContactMessageThread({
  enquiry,
  replies,
}: {
  enquiry: typeof contactMessages.$inferSelect;
  replies: ContactMessageReply[];
}) {
  return (
    <MessageConversationThread
      enquiry={enquiry}
      replies={replies}
      viewer="studio"
    />
  );
}
