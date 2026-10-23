import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import type { UserRole } from "~/server/db/schema";
import {
  getNotificationFeed,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
} from "~/server/notifications";
import type { NotificationContext } from "~/server/notifications/types";
import { NOTIFICATION_TYPES } from "~/server/notifications/types";

function resolveContext(
  sessionRole: UserRole | undefined,
  requested: string | null,
): NotificationContext | null {
  const team = isTeam(sessionRole);
  if (requested === "portal") return team ? null : "portal";
  if (requested === "studio") return team ? "studio" : null;
  return team ? "studio" : "portal";
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const context = resolveContext(session.user.role, searchParams.get("context"));
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const typeParam = searchParams.get("type");
  const type =
    typeParam && (NOTIFICATION_TYPES as readonly string[]).includes(typeParam)
      ? typeParam
      : undefined;

  const feed = await getNotificationFeed(session.user.id, {
    limit: Number.isFinite(limit) ? limit : 20,
    cursor: searchParams.get("cursor") ?? undefined,
    unreadOnly: searchParams.get("filter") === "unread",
    type,
    entityId: searchParams.get("entityId") ?? undefined,
    since: searchParams.get("since") ?? undefined,
    context,
  });

  return NextResponse.json(feed);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsReadForUser(session.user.id);

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: string | undefined;
  try {
    const body = (await request.json()) as { id?: string };
    id = body.id;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const context: NotificationContext = isTeam(session.user.role) ? "studio" : "portal";
  await markNotificationReadForUser(session.user.id, id);
  const { getUnreadNotificationCount } = await import("~/server/notifications");
  const unread = await getUnreadNotificationCount(session.user.id, context);

  return NextResponse.json({ ok: true, unread });
}
