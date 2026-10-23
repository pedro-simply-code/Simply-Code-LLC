import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell, type DashboardNavItem } from "~/components/dashboard-shell";
import { NotificationBell } from "~/components/notification-bell";
import { SignOutButton } from "~/components/sign-out-button";
import { auth } from "~/lib/auth";
import { sidebarCookieName } from "~/lib/dashboard";
import { isTeam, roleLabel } from "~/lib/roles";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

const NAV: DashboardNavItem[] = [
  { href: "/portal", label: "Projects", icon: "projects", section: "Workspace" },
  { href: "/portal/messages", label: "Messages", icon: "messages", section: "Workspace" },
  {
    href: "/portal/notifications",
    label: "Notifications",
    icon: "notifications",
    section: "Workspace",
  },
  { href: "/portal/profile", label: "Profile", icon: "profile", section: "Workspace" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portal");
  if (isTeam(session.user.role)) redirect("/studio");

  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get(sidebarCookieName("portal"))?.value === "1";

  return (
    <DashboardShell
      variant="portal"
      nav={NAV}
      defaultCollapsed={defaultCollapsed}
      user={{
        name: session.user.name,
        email: session.user.email,
        roleLabel: roleLabel(session.user.role),
      }}
      actions={
        <>
          <NotificationBell context="portal" viewAllHref="/portal/notifications" />
          <SignOutButton compact />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
