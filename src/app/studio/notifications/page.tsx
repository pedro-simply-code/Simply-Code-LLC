import { redirect } from "next/navigation";
import { NotificationsWorkspace } from "~/components/notifications/notifications-workspace";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id || !isTeam(session.user.role)) redirect("/login");

  return (
    <NotificationsWorkspace
      context="studio"
      description="Contact enquiries go to founders. Project events go to the project lead, or founders when no lead is assigned."
    />
  );
}
