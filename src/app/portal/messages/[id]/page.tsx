import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageConversationThread } from "~/components/messages/conversation-thread";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { appGhostButton, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";
import {
  backfillClientInboxForPortalUser,
  clientOwnsContactMessage,
  markClientConversationRead,
} from "~/server/messages/inbox";
import {
  getContactMessageById,
  getContactMessageReplyHistory,
} from "~/server/messages/queries";

export const dynamic = "force-dynamic";

function conversationTitle(service: string | null) {
  return service
    ? `Project enquiry · ${service}`
    : "Conversation with Simply Code";
}

export default async function PortalConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email)
    redirect("/login?callbackUrl=/portal/messages");

  const { id } = await params;
  const owns = await clientOwnsContactMessage(id, session.user.email);
  if (!owns) notFound();

  await backfillClientInboxForPortalUser(session.user.id, session.user.email);
  await markClientConversationRead(session.user.id, session.user.email, id);

  const [enquiry, replies] = await Promise.all([
    getContactMessageById(id),
    getContactMessageReplyHistory(id),
  ]);
  if (!enquiry) notFound();

  return (
    <div>
      <StudioHeader
        title={conversationTitle(enquiry.service)}
        description={`Started ${new Date(enquiry.createdAt).toLocaleDateString()}`}
        actions={
          <Link href="/portal/messages" className={appGhostButton}>
            All conversations
          </Link>
        }
      />

      <div className="bg-sc-section-alt/30 mb-4 rounded-md border border-[#15130f]/10 px-4 py-3 text-xs text-[#6f6a60]">
        This thread includes replies we sent to your email before you had portal
        access, when they were about this same contact message.
      </div>

      <MessageConversationThread
        enquiry={enquiry}
        replies={replies}
        viewer="client"
      />

      {replies.length === 0 ? (
        <p className={cn(appPanel, "mt-4 px-5 py-4 text-sm text-[#6f6a60]")}>
          We typically reply here and by email. You do not need to send another
          form unless your question changed.
        </p>
      ) : null}
    </div>
  );
}
