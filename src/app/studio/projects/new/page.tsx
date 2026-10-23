import { redirect } from "next/navigation";
import { ProjectForm } from "~/components/studio/project-form";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { canCreateProjects, isFounder } from "~/lib/roles";
import { createProject } from "~/server/studio/actions";
import { getClients, getTeamUsers, getTechnologies } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
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
