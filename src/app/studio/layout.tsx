import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell, type DashboardNavItem } from "~/components/dashboard-shell";
import { NotificationBell } from "~/components/notification-bell";
import { SignOutButton } from "~/components/sign-out-button";
import { auth } from "~/lib/auth";
import { sidebarCookieName } from "~/lib/dashboard";
import { canManageReviews, isFounder, isTeam, roleLabel } from "~/lib/roles";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio");
  if (!isTeam(session.user.role)) redirect("/portal");

  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get(sidebarCookieName("studio"))?.value === "1";
  const founder = isFounder(session.user.role);
  const reviewer = canManageReviews(session.user.role);

  const nav: DashboardNavItem[] = [
    { href: "/studio", label: "Overview", icon: "overview", section: "Workspace" },
    {
      href: "/studio/notifications",
      label: "Notifications",
      icon: "notifications",
      section: "Workspace",
    },
    { href: "/studio/profile", label: "Profile", icon: "profile", section: "Workspace" },
    { href: "/studio/projects", label: "Projects", icon: "projects", section: "Manage" },
    ...(reviewer
      ? [
          {
            href: "/studio/reviews",
            label: "Reviews",
            icon: "reviews" as const,
            section: "Manage",
          },
        ]
      : []),
    ...(founder
      ? [
          {
            href: "/studio/messages",
            label: "Messages",
            icon: "messages" as const,
            section: "Manage",
          },
          { href: "/studio/team", label: "Team", icon: "team" as const, section: "Manage" },
          {
            href: "/studio/technologies",
            label: "Technologies",
            icon: "technologies" as const,
            section: "Manage",
          },
          {
            href: "/studio/clients",
            label: "Clients",
            icon: "clients" as const,
            section: "Manage",
          },
          {
            href: "/studio/settings",
            label: "Site settings",
            icon: "settings" as const,
            section: "Manage",
          },
        ]
      : []),
  ];

  return (
    <DashboardShell
      variant="studio"
      nav={nav}
      defaultCollapsed={defaultCollapsed}
      user={{
        name: session.user.name,
        email: session.user.email,
        roleLabel: roleLabel(session.user.role),
      }}
      actions={
        <>
          <NotificationBell />
          <SignOutButton compact />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
