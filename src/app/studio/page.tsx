import Link from "next/link";
import { auth } from "~/lib/auth";
import { canCreateProjects, isFounder, roleLabel } from "~/lib/roles";
import { getStudioOverview } from "~/server/studio/queries";
import { getSiteSettings } from "~/server/site-settings/queries";
import { StudioRecentProjects } from "~/components/studio/studio-recent-projects";
import { StudioRolesHelpDialog } from "~/components/studio/studio-roles-help-dialog";
import { StudioOverviewColumn } from "~/components/studio/studio-overview-column";
import {
  StudioOverviewQuickLinks,
  StudioOverviewRequests,
  StudioOverviewStats,
  StudioOverviewUpdates,
} from "~/components/studio/studio-overview-panels";
import { STUDIO_OVERVIEW_PREVIEW_SIZE } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";
import { StudioHeader } from "~/components/studio/ui";
import { appAccentButtonLg } from "~/lib/surface";

export const dynamic = "force-dynamic";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view = parseStudioView(viewParam);
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return null;
  }

  const founder = isFounder(session.user.role);
  const canCreate = canCreateProjects(session.user.role);
  const [overview, siteSettings] = await Promise.all([
    getStudioOverview({
      projectViewerId: founder ? undefined : userId,
      userId,
      founder,
    }),
    founder ? getSiteSettings() : Promise.resolve(null),
  ]);

  const recentPreview = overview.recentProjects.slice(
    0,
    STUDIO_OVERVIEW_PREVIEW_SIZE,
  );
  const recentTotal = overview.recentProjects.length;
  const projectStatusStats = [
    { label: "Draft", value: overview.draftCount, href: "/studio/projects" },
    {
      label: "Published",
      value: overview.publishedCount,
      href: "/studio/projects",
    },
    {
      label: "Completed",
      value: overview.completedCount,
      href: "/studio/projects",
    },
  ];

  const founderStats = founder
    ? [
        { label: "Team", value: overview.teamCount, href: "/studio/team" },
        {
          label: "Clients",
          value: overview.clientCount,
          href: "/studio/clients",
        },
        {
          label: "Technologies",
          value: overview.technologyCount,
          href: "/studio/technologies",
        },
      ]
    : [];

  return (
    <div>
      <StudioHeader
        title="Studio overview"
        description={`Signed in as ${session.user.name ?? session.user.email} · ${roleLabel(session.user.role)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StudioRolesHelpDialog />
            {canCreate ? (
              <Link
                href="/studio/projects/new"
                className="hover:bg-sc-accent inline-flex items-center rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase"
              >
                New project
              </Link>
            ) : null}
          </div>
        }
      />

      <StudioOverviewQuickLinks
        maintenanceMode={siteSettings?.maintenanceMode ?? false}
        unreadNotificationCount={overview.unreadNotificationCount}
        showSiteSettings={founder}
      />

      <div className="space-y-3">
        <StudioOverviewStats stats={projectStatusStats} view={view} />
        {founderStats.length > 0 ? (
          <StudioOverviewStats stats={founderStats} view={view} />
        ) : null}
      </div>

      <div className="mt-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <StudioOverviewColumn
            title="Recent projects"
            description={
              canCreate
                ? "Publishing here updates the public work pages."
                : "Projects assigned to you, most recently updated first."
            }
            footer={
              canCreate ? (
                <div className="flex flex-wrap gap-2">
                  <Link href="/studio/projects" className={appAccentButtonLg}>
                    All projects
                  </Link>
                  <Link
                    href="/studio/projects/new"
                    className={appAccentButtonLg}
                  >
                    Create project
                  </Link>
                </div>
              ) : (
                <Link href="/studio/projects" className={appAccentButtonLg}>
                  All projects
                </Link>
              )
            }
          >
            <StudioRecentProjects
              projects={recentPreview}
              view={view}
              compact
              emptyMessage={
                recentTotal === 0
                  ? canCreate
                    ? "No projects yet. Create the first project from the button above."
                    : "No projects have been assigned to you yet."
                  : undefined
              }
            />
          </StudioOverviewColumn>

          <StudioOverviewRequests
            items={overview.overviewRequests}
            openCount={overview.openRequestCount}
            view={view}
          />
          <StudioOverviewUpdates items={overview.overviewUpdates} view={view} />
        </div>
      </div>
    </div>
  );
}
