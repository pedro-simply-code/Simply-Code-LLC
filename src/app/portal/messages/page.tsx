import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";
import {
  backfillClientInboxForPortalUser,
  getClientConversationSummaries,
} from "~/server/messages/inbox";

export const dynamic = "force-dynamic";

export default async function PortalMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email)
    redirect("/login?callbackUrl=/portal/messages");

  await backfillClientInboxForPortalUser(session.user.id, session.user.email);
  const conversations = await getClientConversationSummaries(
    session.user.id,
    session.user.email,
  );

  return (
    <div>
      <StudioHeader
        title="Messages"
        description="Chat-style history with our team: your contact form messages and every reply, including ones we sent by email before you had portal access."
      />

      {conversations.length === 0 ? (
        <p className={cn(appPanel, "px-5 py-10 text-sm text-[#6f6a60]")}>
          No conversations yet. When you contact us through the site, the thread
          appears here once we reply (or right away if you already sent a
          message with this email).
        </p>
      ) : (
        <ul className={cn(appPanel, "divide-y divide-[#15130f]/10")}>
          {conversations.map((thread) => (
            <li key={thread.contactMessageId}>
              <Link
                href={`/portal/messages/${thread.contactMessageId}`}
                className="hover:bg-sc-section-alt/40 block px-5 py-5 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">{thread.subject}</h2>
                      {thread.unreadCount > 0 ? (
                        <span className="bg-sc-accent rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                          {thread.unreadCount} new
                        </span>
                      ) : null}
                      {thread.replyCount === 0 ? (
                        <span className="rounded-md bg-[#fff8e6] px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#b45309] uppercase">
                          Awaiting reply
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#57524a]">
                      {thread.preview}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-[#9a9488]">
                    {new Date(thread.lastActivityAt).toLocaleString()}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
