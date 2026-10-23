import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkspace } from "~/components/studio/project-workspace";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getClients, getProjectById, getTeamUsers, getTechnologies } from "~/server/studio/queries";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const detail = await getProjectById(id);
  if (!detail) notFound();

  const founder = isFounder(session.user.role);
  const isManager =
    founder ||
    detail.members.some(
      (member) => member.userId === session.user.id && member.projectRole === "lead",
    );
  const isMember = detail.members.some((member) => member.userId === session.user.id);

  if (!isManager && !isMember && !founder) {
    redirect("/studio/projects");
  }

  let team: Awaited<ReturnType<typeof getTeamUsers>> = [];
  let technologies: Awaited<ReturnType<typeof getTechnologies>> = [];
  let clients: Awaited<ReturnType<typeof getClients>> = [];
  let assignableTeam: Awaited<ReturnType<typeof getTeamUsers>> = [];

  if (isManager) {
    [team, technologies, clients] = await Promise.all([
      getTeamUsers(),
      getTechnologies(),
      getClients(),
    ]);
    const memberIds = new Set(detail.members.map((member) => member.userId));
    assignableTeam = founder ? team : team.filter((person) => !memberIds.has(person.id));
  }

  const { project } = detail;

  return (
    <div>
      <StudioHeader
        title={project.title}
        description={`${project.status} · /work/${project.slug}`}
        actions={
          <>
            {project.status === "published" || project.status === "completed" ? (
              <Link
                href={`/work/${project.slug}`}
                className={cn("inline-flex", appGhostButtonLg)}
              >
                View public page
              </Link>
            ) : null}
            <Link
              href="/studio/projects"
              className={cn("inline-flex", appGhostButtonLg)}
            >
              All projects
            </Link>
          </>
        }
      />

      <ProjectWorkspace
        detail={detail}
        team={team}
        technologies={technologies}
        clients={clients}
        assignableTeam={assignableTeam}
        isManager={isManager}
        isMember={isMember}
        founder={founder}
      />
    </div>
  );
}
