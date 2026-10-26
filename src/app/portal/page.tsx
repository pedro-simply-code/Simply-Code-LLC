import Link from "next/link";
import { auth } from "~/lib/auth";
import { getPortalProjects } from "~/server/studio/queries";
import { StudioHeader } from "~/components/studio/ui";
import { appChip, appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await auth();
  const projects = session?.user.id
    ? await getPortalProjects(session.user.id)
    : [];

  return (
    <div>
      <StudioHeader
        title="Your projects"
        description="Follow progress, read updates, and send new requests to the team."
      />

      {projects.length === 0 ? (
        <div className={cn(appPanel, "p-8")}>
          <p className="text-sm font-semibold">
            No projects linked to this account yet.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#57524a]">
            Your account is active, but an admin still needs to link it to a
            client. Email{" "}
            <a
              href="mailto:hello@simplycode.io"
              className="underline underline-offset-4"
            >
              hello@simplycode.io
            </a>{" "}
            and we will connect it.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portal/projects/${project.id}`}
              className={cn(appPanel, appPanelHover, "group p-6")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sc-accent text-[10px] font-bold tracking-[0.14em] uppercase">
                    {project.stackLabel || project.clientName || "Project"}
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.02em]">
                    {project.title}
                  </h2>
                </div>
                <span className={appChip}>{project.status}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#57524a]">
                {project.summary}
              </p>
              <p className="mt-4 text-[11px] text-[#6f6a60]">
                {project.lead?.name
                  ? `Lead: ${project.lead.name}`
                  : "Lead: Simply Code"}
                {project.updates.length > 0
                  ? ` · ${project.updates.length} update${project.updates.length === 1 ? "" : "s"}`
                  : ""}
              </p>
              <span className="group-hover:text-sc-accent mt-4 inline-flex text-[10px] font-bold tracking-[0.14em] uppercase">
                Open project →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
