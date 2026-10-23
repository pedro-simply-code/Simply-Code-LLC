import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getContactMessages } from "~/server/studio/queries";
import { resolveContactRecipientsByEmail } from "~/server/messages/recipient";
import { appEmptyState, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  switch (status) {
    case "replied":
      return "Replied";
    case "archived":
      return "Archived";
    default:
      return "New";
  }
}

export default async function MessagesPage() {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const messages = await getContactMessages();
  const recipients = await resolveContactRecipientsByEmail(messages.map((row) => row.email));

  return (
    <div>
      <StudioHeader
        title="Contact messages"
        description="Public contact form enquiries. Reply in the portal when the sender has a client account; otherwise reply by email. Project email routing stays separate."
      />

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className={cn(appEmptyState, "p-8")}>No contact messages yet.</p>
        ) : (
          messages.map((message) => {
            const recipient = recipients.get(message.email.trim().toLowerCase()) ?? {
              email: message.email,
              channel: "email" as const,
              portalUsers: [],
            };
            const hasPortal = recipient.channel === "portal";

            return (
              <article key={message.id} className={cn(appPanel, "p-5")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">{message.name}</h2>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] uppercase",
                          message.status === "replied"
                            ? "bg-[#e8f5e9] text-[#2e7d32]"
                            : "bg-[#fff8e6] text-[#b45309]",
                        )}
                      >
                        {statusLabel(message.status)}
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] uppercase",
                          hasPortal
                            ? "bg-sc-accent/15 text-sc-ink"
                            : "bg-sc-section-alt text-[#6f6a60]",
                        )}
                      >
                        {hasPortal ? "Portal client" : "Email only"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#6f6a60]">
                      {message.email}
                      {message.company ? ` · ${message.company}` : ""}
                      {message.service ? ` · ${message.service}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                    <Link
                      href={`/studio/messages/${message.id}`}
                      className="rounded-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-sc-accent"
                    >
                      {message.status === "replied" ? "View thread" : "Reply"}
                    </Link>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[#57524a] line-clamp-4">
                  {message.message}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
