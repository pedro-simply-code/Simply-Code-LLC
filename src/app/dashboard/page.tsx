import { auth } from "~/lib/auth";
import { DashboardPosts } from "~/app/dashboard/dashboard-posts";
import { DashboardNote } from "~/app/dashboard/dashboard-note";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Hello, {session?.user.name ?? session?.user.email}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Role: <code className="rounded bg-muted px-1.5 py-0.5">{session?.user.role}</code>
        </p>
      </div>
      <DashboardNote />
      <DashboardPosts />
    </div>
  );
}
