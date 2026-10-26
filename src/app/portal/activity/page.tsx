import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectActivityFeed } from "~/components/projects/project-activity-feed";
import { StudioCard, StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { getPortalActivityFeed } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function PortalActivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portal/activity");
  if (isTeam(session.user.role)) redirect("/studio");

  const items = await getPortalActivityFeed(session.user.id);

  return (
    <div>
      <StudioHeader
        title="Activity"
        description="Updates, requests, files, and milestones across all your projects."
      />

      {items.length === 0 ? (
        <div className={cn(appPanel, "p-8")}>
          <p className="text-sm text-[#6f6a60]">
            No activity yet. Open a project to get started.
          </p>
        </div>
      ) : (
        <StudioCard title="Recent">
          <ProjectActivityFeed
            items={items.map((item) => ({
              ...item,
              meta: `${item.meta} · ${item.projectTitle}`,
            }))}
          />
          <p className="mt-4 text-[11px] text-[#6f6a60]">
            Open a project from{" "}
            <Link
              href="/portal"
              className="text-sc-accent font-semibold hover:underline"
            >
              Projects
            </Link>{" "}
            for full detail.
          </p>
        </StudioCard>
      )}
    </div>
  );
}
