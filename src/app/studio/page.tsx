import Link from "next/link";
import { auth } from "~/lib/auth";
import {
  canCreateProjects,
  canManageReviews,
  isFounder,
  roleLabel,
} from "~/lib/roles";
import { getStudioOverview } from "~/server/studio/queries";
import { EmptyState, StudioCard, StudioHeader } from "~/components/studio/ui";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const session = await auth();
  const founder = isFounder(session?.user.role);
  const canCreate = canCreateProjects(session?.user.role);
  const overview = await getStudioOverview(founder ? undefined : session?.user.id);
  const reviewer = canManageReviews(session?.user.role);

  const stats = [
    { label: "Projects", value: overview.projectCount, href: "/studio/projects" },
    { label: "Published", value: overview.publishedCount, href: "/work" },
    ...(founder
      ? [
          { label: "Team", value: overview.teamCount, href: "/studio/team" },
          { label: "Clients", value: overview.clientCount, href: "/studio/clients" },
          { label: "Technologies", value: overview.technologyCount, href: "/studio/technologies" },
        ]
      : []),
    ...(reviewer
      ? [
          {
            label: "Reviews to approve",
            value: overview.pendingReviewCount,
            href: "/studio/reviews",
          },
        ]
      : []),
  ];

  return (
    <div>
      <StudioHeader
        title="Studio overview"
        description={`Signed in as ${session?.user.name ?? session?.user.email} · ${roleLabel(session?.user.role)}`}
        actions={
          canCreate ? (
            <Link
              href="/studio/projects/new"
              className="inline-flex items-center bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              New project
            </Link>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-[#15130f]/12 bg-white p-5 transition-colors hover:border-[#f0a500]"
          >
            <p className="text-[32px] leading-none font-black tracking-[-0.03em] text-[#b8770a]">
              {stat.value}
            </p>
            <p className="mt-2 text-[10px] font-bold tracking-[0.16em] text-[#57524a] uppercase">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <StudioCard
          title="Recent projects"
          description={
            canCreate
              ? "Publishing here updates the public work pages."
              : "Projects assigned to you, most recently updated first."
          }
        >
          {overview.recentProjects.length === 0 ? (
            <EmptyState>
              {canCreate
                ? "No projects yet. Import the existing portfolio or create the first project."
                : "No projects have been assigned to you yet."}
            </EmptyState>
          ) : (
            <ul className="divide-y divide-[#15130f]/10">
              {overview.recentProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Link
                      href={`/studio/projects/${project.id}`}
                      className="text-sm font-semibold hover:text-[#b8770a]"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-[#6f6a60]">
                      {project.stackLabel || "No stack"} · {project.status}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {canCreate ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/studio/projects/new"
                className="inline-flex items-center border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-[#b8770a]"
              >
                Create project
              </Link>
            </div>
          ) : null}
        </StudioCard>

        <StudioCard
          title="How routing works"
          description="Roles inherit downwards: founder → lead → developer."
        >
          <ul className="space-y-3 text-sm leading-relaxed text-[#57524a]">
            <li>
              <strong className="text-[#15130f]">Founder</strong> manages team, technologies,
              clients, projects and reviews.
            </li>
            <li>
              <strong className="text-[#15130f]">Lead</strong> only sees assigned projects. They can
              edit projects they lead and add developers, but cannot create projects or manage
              reviews.
            </li>
            <li>
              <strong className="text-[#15130f]">Developer</strong> sees their assigned projects but
              project email goes to the lead or founder.
            </li>
            <li>
              <strong className="text-[#15130f]">Client</strong> uses the portal only.
            </li>
          </ul>
        </StudioCard>
      </div>
    </div>
  );
}
