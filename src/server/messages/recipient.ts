import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { clientMembers, clients, users } from "~/server/db/schema";

export type PortalContactUser = {
  userId: string;
  name: string | null;
  clientNames: string[];
};

export type ContactRecipient = {
  email: string;
  channel: "portal" | "email";
  portalUsers: PortalContactUser[];
};

function aggregatePortalUsers(
  rows: { userId: string; name: string | null; clientName: string }[],
): PortalContactUser[] {
  const byUser = new Map<string, PortalContactUser>();
  for (const row of rows) {
    const existing = byUser.get(row.userId);
    if (existing) {
      if (!existing.clientNames.includes(row.clientName)) {
        existing.clientNames.push(row.clientName);
      }
      continue;
    }
    byUser.set(row.userId, {
      userId: row.userId,
      name: row.name,
      clientNames: [row.clientName],
    });
  }
  return [...byUser.values()];
}

export async function resolveContactRecipient(
  email: string,
): Promise<ContactRecipient> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { email, channel: "email", portalUsers: [] };
  }

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      clientName: clients.name,
    })
    .from(users)
    .innerJoin(clientMembers, eq(clientMembers.userId, users.id))
    .innerJoin(clients, eq(clients.id, clientMembers.clientId))
    .where(
      and(eq(users.role, "client"), sql`lower(${users.email}) = ${normalized}`),
    );

  const portalUsers = aggregatePortalUsers(rows);
  return {
    email,
    channel: portalUsers.length > 0 ? "portal" : "email",
    portalUsers,
  };
}

export async function resolveContactRecipientsByEmail(
  emails: string[],
): Promise<Map<string, ContactRecipient>> {
  const normalized = [
    ...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ];
  const map = new Map<string, ContactRecipient>();
  if (normalized.length === 0) return map;

  const rows = await db
    .select({
      email: users.email,
      userId: users.id,
      name: users.name,
      clientName: clients.name,
    })
    .from(users)
    .innerJoin(clientMembers, eq(clientMembers.userId, users.id))
    .innerJoin(clients, eq(clients.id, clientMembers.clientId))
    .where(
      and(
        eq(users.role, "client"),
        sql`lower(${users.email}) in (${sql.join(
          normalized.map((value) => sql`${value}`),
          sql`, `,
        )})`,
      ),
    );

  for (const email of normalized) {
    map.set(email, { email, channel: "email", portalUsers: [] });
  }

  const grouped = new Map<
    string,
    { userId: string; name: string | null; clientName: string }[]
  >();
  for (const row of rows) {
    if (!row.email) continue;
    const key = row.email.trim().toLowerCase();
    const list = grouped.get(key) ?? [];
    list.push({
      userId: row.userId,
      name: row.name,
      clientName: row.clientName,
    });
    grouped.set(key, list);
  }

  for (const [key, userRows] of grouped) {
    const portalUsers = aggregatePortalUsers(userRows);
    map.set(key, {
      email: emails.find((e) => e.trim().toLowerCase() === key) ?? key,
      channel: "portal",
      portalUsers,
    });
  }

  return map;
}
