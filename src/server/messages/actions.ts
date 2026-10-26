"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireFounder } from "~/server/authz";
import { isUuid } from "~/server/studio/queries";
import { db } from "~/server/db";
import { clientInboxMessages, contactMessages } from "~/server/db/schema";
import { sendEmail } from "~/server/email/sendEmail";
import { getContactMessageById } from "~/server/messages/queries";
import { resolveContactRecipient } from "~/server/messages/recipient";
import { parseMessageAttachmentsFromForm } from "~/lib/message-attachments";
import {
  filterAttachmentsWithClaims,
  releaseUserUploadClaims,
} from "~/server/uploads/claims";
import { attachmentsHtmlBlock } from "~/server/messages/attachment-email";
import { notifyUsers } from "~/server/notifications/delivery";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function replyToContactMessage(formData: FormData) {
  const session = await requireFounder();

  const contactMessageId = text(formData, "contactMessageId");
  const body = text(formData, "body");
  const alsoEmail = checked(formData, "alsoEmail");

  if (!isUuid(contactMessageId) || !body) {
    redirect("/studio/messages");
  }

  const enquiry = await getContactMessageById(contactMessageId);
  if (!enquiry) redirect("/studio/messages");

  const recipient = await resolveContactRecipient(enquiry.email);
  const attachments = await filterAttachmentsWithClaims(
    session.user.id,
    parseMessageAttachmentsFromForm(formData),
  );
  const subject = `Re: your project enquiry${enquiry.service ? ` (${enquiry.service})` : ""}`;
  const usePortal =
    recipient.channel === "portal" && recipient.portalUsers.length > 0;
  const sendEmailToo = !usePortal || alsoEmail;
  const channel =
    usePortal && sendEmailToo ? "both" : usePortal ? "portal" : "email";

  if (usePortal) {
    for (const portalUser of recipient.portalUsers) {
      await db.insert(clientInboxMessages).values({
        recipientUserId: portalUser.userId,
        contactMessageId: enquiry.id,
        subject,
        body,
        attachments,
        channel,
        sentById: session.user.id,
      });
    }

    await notifyUsers(
      recipient.portalUsers.map((user) => user.userId),
      {
        type: "message",
        title: "Message from Simply Code",
        body: body.slice(0, 160),
        href: "/portal/messages",
      },
    );
  } else {
    await db.insert(clientInboxMessages).values({
      recipientUserId: null,
      contactMessageId: enquiry.id,
      subject,
      body,
      attachments,
      channel: "email",
      sentById: session.user.id,
    });
  }

  if (sendEmailToo) {
    const html = `
      <p>Hi ${escapeHtml(enquiry.name)},</p>
      <p style="white-space: pre-wrap">${escapeHtml(body)}</p>
      ${attachmentsHtmlBlock(attachments)}
      <hr />
      <p style="color:#6f6a60;font-size:12px">Your original message:</p>
      <p style="white-space: pre-wrap;color:#57524a">${escapeHtml(enquiry.message)}</p>
    `;
    try {
      await sendEmail({
        to: enquiry.email,
        subject,
        html,
      });
    } catch (error) {
      console.error("[messages] Failed to send email reply", error);
      if (!usePortal) {
        redirect(`/studio/messages/${contactMessageId}?error=email`);
      }
    }
  }

  await db
    .update(contactMessages)
    .set({ status: "replied" })
    .where(eq(contactMessages.id, contactMessageId));

  await releaseUserUploadClaims(
    session.user.id,
    attachments.map((item) => item.url),
  );

  revalidatePath("/studio/messages");
  revalidatePath(`/studio/messages/${contactMessageId}`);
  revalidatePath("/portal/messages");
  redirect(`/studio/messages/${contactMessageId}?sent=1`);
}
