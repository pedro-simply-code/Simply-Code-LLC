import { redirect } from "next/navigation";
import { ProjectForm } from "~/components/studio/project-form";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { canCreateProjects, isFounder } from "~/lib/roles";
import { createProject } from "~/server/studio/actions";
import { getClients, getTeamUsers, getTechnologies } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  if (!canCreateProjects(session?.user.role)) redirect("/studio/projects");

  const [team, technologies, clients] = await Promise.all([
    getTeamUsers(),
    getTechnologies(),
    getClients(),
  ]);

  return (
    <div>
      <StudioHeader
        title="New project"
        description="Create the project, assign a lead and developers, and publish when it is ready."
      />
      {error === "cover-upload" ? (
        <p className="mb-6 border border-[#9a3b2e]/25 bg-[#fdf1ef] px-4 py-3 text-sm text-[#9a3b2e]">
          The cover image could not be saved. Try again or use a smaller file.
        </p>
      ) : null}
      <ProjectForm
        action={createProject}
        team={team}
        technologies={technologies}
        clients={clients}
        leadId={session?.user.id}
        canChooseLead={isFounder(session?.user.role)}
      />
    </div>
  );
}
