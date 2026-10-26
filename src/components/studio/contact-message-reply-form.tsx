import { MessageAttachmentUpload } from "~/components/messages/message-attachment-upload";
import { Field, StudioTextarea } from "~/components/studio/ui";
import type { ContactRecipient } from "~/server/messages/recipient";
import { replyToContactMessage } from "~/server/messages/actions";
import { appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function ContactMessageReplyForm({
  contactMessageId,
  recipient,
}: {
  contactMessageId: string;
  recipient: ContactRecipient;
}) {
  const usePortal = recipient.channel === "portal";

  return (
    <form action={replyToContactMessage} className="space-y-4">
      <input type="hidden" name="contactMessageId" value={contactMessageId} />

      <div
        className={cn(
          "rounded-md px-4 py-3 text-xs leading-relaxed",
          usePortal
            ? "bg-[#e8f5e9] text-[#2e7d32] ring-1 ring-[#2e7d32]/20"
            : "bg-sc-section-alt text-[#57524a] ring-1 ring-[#15130f]/8",
        )}
      >
        {usePortal ? (
          <>
            <p className="font-semibold">Portal client</p>
            <p className="mt-1">
              {recipient.portalUsers
                .map((user) => user.name ?? "Client")
                .join(", ")}{" "}
              can read this in the client portal
              {recipient.portalUsers[0]?.clientNames.length
                ? ` (${recipient.portalUsers[0].clientNames.join(", ")})`
                : ""}
              .
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">Email only</p>
            <p className="mt-1">
              No portal account matches <strong>{recipient.email}</strong>. Your
              reply will be sent by email.
            </p>
          </>
        )}
      </div>

      <Field
        label="Your reply"
        hint="Plain language is fine. The client sees this message in the portal and/or email."
      >
        <StudioTextarea name="body" required rows={6} className="min-h-0" />
      </Field>

      <Field
        label="Attachments"
        hint="Optional. Same limits as the public contact form."
      >
        <MessageAttachmentUpload />
      </Field>

      {usePortal ? (
        <label className="text-sc-ink flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="alsoEmail"
            className="accent-sc-accent mt-0.5 size-4"
          />
          <span>
            Also send by email to <strong>{recipient.email}</strong>{" "}
            (recommended for first reply)
          </span>
        </label>
      ) : null}

      <button type="submit" className={appPrimaryButtonStudioSubmit}>
        {usePortal ? "Send in portal" : "Send email"}
      </button>
    </form>
  );
}
