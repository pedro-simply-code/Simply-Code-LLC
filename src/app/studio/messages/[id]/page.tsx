import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactMessageReplyForm } from "~/components/studio/contact-message-reply-form";
import { ContactMessageThread } from "~/components/studio/contact-message-thread";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { appGhostButton, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";
import {
  getContactMessageById,
  getContactMessageReplyHistory,
} from "~/server/messages/queries";
import { resolveContactRecipient } from "~/server/messages/recipient";

export const dynamic = "force-dynamic";

export default async function ContactMessagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { id } = await params;
  const query = await searchParams;
  const message = await getContactMessageById(id);
  if (!message) notFound();

  const [recipient, replies] = await Promise.all([
    resolveContactRecipient(message.email),
    getContactMessageReplyHistory(message.id),
  ]);

  return (
    <div>
      <StudioHeader
        title={message.name}
        description={`${message.email}${message.service ? ` · ${message.service}` : ""}`}
        actions={
          <Link href="/studio/messages" className={appGhostButton}>
            Back to messages
          </Link>
        }
      />

      {query.sent === "1" ? (
        <p className="mb-4 rounded-md bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Reply sent and saved to this conversation.
        </p>
      ) : null}
      {query.error === "email" ? (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-[#9a3b2e]">
          Could not send email. Check SMTP settings or try again.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-[#6f6a60]">
        {message.company ? <span>{message.company}</span> : null}
        <span>·</span>
        <span className="capitalize">{message.status}</span>
        <span>·</span>
        <span>
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <h2 className="text-[12px] font-bold tracking-[0.16em] uppercase">
            Conversation
          </h2>
          <ContactMessageThread enquiry={message} replies={replies} />
        </div>

        <section
          className={cn(
            appPanel,
            "h-fit p-5 lg:sticky lg:top-24 lg:col-span-2",
          )}
        >
          <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase">
            Compose reply
          </h3>
          <div className="mt-4">
            <ContactMessageReplyForm
              contactMessageId={message.id}
              recipient={recipient}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
