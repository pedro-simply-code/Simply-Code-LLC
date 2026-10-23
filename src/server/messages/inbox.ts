import "server-only";

import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { clientInboxMessages, contactMessages } from "~/server/db/schema";
import { getContactMessageReplyHistory } from "~/server/messages/queries";

export type ClientConversationSummary = {
  contactMessageId: string;
  subject: string;
  service: string | null;
  status: string;
  createdAt: Date;
  lastActivityAt: Date;
  preview: string;
  replyCount: number;
  unreadCount: number;
};

function conversationSubject(enquiry: typeof contactMessages.$inferSelect) {
  return enquiry.service
    ? `Project enquiry · ${enquiry.service}`
    : "Your message to Simply Code";
}

/** Attach email-only reply rows to a portal user when their account matches the enquiry email. */
export async function backfillClientInboxForPortalUser(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  const enquiries = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(sql`lower(${contactMessages.email}) = ${normalized}`);

  const ids = enquiries.map((row) => row.id);
  if (ids.length === 0) return;

  await db
    .update(clientInboxMessages)
    .set({ recipientUserId: userId })
    .where(
      and(
        inArray(clientInboxMessages.contactMessageId, ids),
        isNull(clientInboxMessages.recipientUserId),
      ),
    );
}

export async function clientOwnsContactMessage(
  contactMessageId: string,
  userEmail: string,
): Promise<boolean> {
  const normalized = userEmail.trim().toLowerCase();
  const [row] = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.id, contactMessageId),
        sql`lower(${contactMessages.email}) = ${normalized}`,
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function getClientConversationSummaries(
  userId: string,
  userEmail: string,
): Promise<ClientConversationSummary[]> {
  const normalized = userEmail.trim().toLowerCase();
  if (!normalized) return [];

  const enquiries = await db
    .select()
    .from(contactMessages)
    .where(sql`lower(${contactMessages.email}) = ${normalized}`)
    .orderBy(desc(contactMessages.createdAt));

  if (enquiries.length === 0) return [];

  const enquiryIds = enquiries.map((row) => row.id);
  const inboxRows = await db
    .select({
      contactMessageId: clientInboxMessages.contactMessageId,
      readAt: clientInboxMessages.readAt,
      recipientUserId: clientInboxMessages.recipientUserId,
    })
    .from(clientInboxMessages)
    .where(
      and(
        inArray(clientInboxMessages.contactMessageId, enquiryIds),
        or(
          eq(clientInboxMessages.recipientUserId, userId),
          isNull(clientInboxMessages.recipientUserId),
        ),
      ),
    );

  const unreadByContact = new Map<string, number>();
  for (const row of inboxRows) {
    if (!row.contactMessageId) continue;
    if (row.readAt) continue;
    unreadByContact.set(row.contactMessageId, (unreadByContact.get(row.contactMessageId) ?? 0) + 1);
  }

  const summaries: ClientConversationSummary[] = [];
  for (const enquiry of enquiries) {
    const replies = await getContactMessageReplyHistory(enquiry.id);
    const lastReply = replies.at(-1);
    const lastActivityAt = lastReply?.createdAt ?? enquiry.createdAt;
    const preview = (lastReply?.body ?? enquiry.message).slice(0, 160);

    summaries.push({
      contactMessageId: enquiry.id,
      subject: conversationSubject(enquiry),
      service: enquiry.service,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
      lastActivityAt,
      preview,
      replyCount: replies.length,
      unreadCount: unreadByContact.get(enquiry.id) ?? 0,
    });
  }

  summaries.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  return summaries;
}

export async function markClientConversationRead(
  userId: string,
  userEmail: string,
  contactMessageId: string,
) {
  const owns = await clientOwnsContactMessage(contactMessageId, userEmail);
  if (!owns) return;

  await backfillClientInboxForPortalUser(userId, userEmail);

  const now = new Date();
  await db
    .update(clientInboxMessages)
    .set({ readAt: now })
    .where(
      and(
        eq(clientInboxMessages.contactMessageId, contactMessageId),
        eq(clientInboxMessages.recipientUserId, userId),
        isNull(clientInboxMessages.readAt),
      ),
    );
}
