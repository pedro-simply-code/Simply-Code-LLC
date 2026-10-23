import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { sanitizeMessageAttachments, type MessageAttachment } from "~/lib/message-attachments";
import { db } from "~/server/db";
import { clientInboxMessages, contactMessages, users } from "~/server/db/schema";

export async function getContactMessageById(id: string) {
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return row ?? null;
}

export type ContactMessageReply = {
  id: string;
  subject: string;
  body: string;
  attachments: MessageAttachment[];
  channel: string;
  createdAt: Date;
  sentByName: string | null;
};

export async function getContactMessageReplyHistory(
  contactMessageId: string,
): Promise<ContactMessageReply[]> {
  const rows = await db
    .select({
      id: clientInboxMessages.id,
      subject: clientInboxMessages.subject,
      body: clientInboxMessages.body,
      attachments: clientInboxMessages.attachments,
      channel: clientInboxMessages.channel,
      createdAt: clientInboxMessages.createdAt,
      sentByName: users.name,
    })
    .from(clientInboxMessages)
    .leftJoin(users, eq(users.id, clientInboxMessages.sentById))
    .where(eq(clientInboxMessages.contactMessageId, contactMessageId))
    .orderBy(asc(clientInboxMessages.createdAt));

  const seen = new Set<string>();
  return rows
    .map((row) => ({
      ...row,
      attachments: sanitizeMessageAttachments(row.attachments),
    }))
    .filter((row) => {
      const key = `${row.createdAt.toISOString()}|${row.body}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function getClientInboxForUser(userId: string) {
  return db
    .select()
    .from(clientInboxMessages)
    .where(eq(clientInboxMessages.recipientUserId, userId))
    .orderBy(desc(clientInboxMessages.createdAt))
    .limit(50);
}
