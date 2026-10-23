import { redirect } from "next/navigation";
import { NotificationsWorkspace } from "~/components/notifications/notifications-workspace";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";

export const dynamic = "force-dynamic";

export default async function PortalNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portal/notifications");
  if (isTeam(session.user.role)) redirect("/studio/notifications");

  return (
    <NotificationsWorkspace
      context="portal"
      description="Project updates, request outcomes, and other messages from the Simply Code team."
    />
  );
}
