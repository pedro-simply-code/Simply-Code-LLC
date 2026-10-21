import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.query.posts.findMany({
    where: eq(posts.authorId, session.user.id),
    orderBy: [desc(posts.createdAt)],
    limit: 20,
  });

  return NextResponse.json({ posts: rows });
}
