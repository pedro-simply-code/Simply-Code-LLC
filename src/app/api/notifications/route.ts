import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
} from "~/server/studio/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [items, unread] = await Promise.all([
    getNotifications(session.user.id, 8),
    getUnreadNotificationCount(session.user.id),
  ]);

  return NextResponse.json({ items, unread });
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

  await markNotificationReadForUser(session.user.id, id);
  const unread = await getUnreadNotificationCount(session.user.id);

  return NextResponse.json({ ok: true, unread });
}
