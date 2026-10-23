import { redirect } from "next/navigation";
import { NotificationsList } from "~/components/notifications-list";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import { markAllNotificationsRead } from "~/server/studio/actions";
import { getNotifications, getUnreadNotificationCount } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function PortalNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portal/notifications");
  if (isTeam(session.user.role)) redirect("/studio/notifications");

  const [items, unread] = await Promise.all([
    getNotifications(session.user.id, 50),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <div>
      <StudioHeader
        title="Notifications"
        description="Project updates, request outcomes, and other messages from the Simply Code team."
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="inline-flex bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
              >
                Mark all read ({unread})
              </button>
            </form>
          ) : null
        }
      />

      <NotificationsList initialItems={items} />
    </div>
  );
}
