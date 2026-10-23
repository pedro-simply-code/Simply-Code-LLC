import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkspace } from "~/components/studio/project-workspace";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getClients, getProjectById, getTeamUsers, getTechnologies } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
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
                className="inline-flex border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-[#b8770a]"
              >
                View public page
              </Link>
            ) : null}
            <Link
              href="/studio/projects"
              className="inline-flex border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-[#b8770a]"
            >
              All projects
            </Link>
          </>
        }
      />

      {error === "request-reason" ? (
        <p className="mb-6 border border-[#9a3b2e]/25 bg-[#fdf1ef] px-4 py-3 text-sm text-[#9a3b2e]">
          A reason is required when rejecting a client request.
        </p>
      ) : null}
      {error === "cover-upload" ? (
        <p className="mb-6 border border-[#9a3b2e]/25 bg-[#fdf1ef] px-4 py-3 text-sm text-[#9a3b2e]">
          The cover image could not be saved. Try again or use a smaller file.
        </p>
      ) : null}

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
