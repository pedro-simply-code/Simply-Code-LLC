import "server-only";

import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import { clients, invites, users } from "~/server/db/schema";

export async function getInviteByToken(token: string) {
  if (!token) return null;

  const [row] = await db
    .select({
      id: invites.id,
      email: invites.email,
      name: invites.name,
      role: invites.role,
      title: invites.title,
      clientId: invites.clientId,
      clientName: clients.name,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
    })
    .from(invites)
    .leftJoin(clients, eq(clients.id, invites.clientId))
    .where(and(eq(invites.token, token), isNull(invites.acceptedAt)))
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  return row;
}

export async function getPendingInvites() {
  return db
    .select({
      id: invites.id,
      email: invites.email,
      name: invites.name,
      role: invites.role,
      title: invites.title,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
      invitedByName: users.name,
      invitedByEmail: users.email,
      clientName: clients.name,
    })
    .from(invites)
    .leftJoin(clients, eq(clients.id, invites.clientId))
    .leftJoin(users, eq(users.id, invites.invitedById))
    .where(and(isNull(invites.acceptedAt), gt(invites.expiresAt, new Date())))
    .orderBy(desc(invites.createdAt));
}
