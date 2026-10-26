import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Pencil, X } from "lucide-react";
import { ProjectForm } from "~/components/studio/project-form";
import { StudioTabs } from "~/components/studio/studio-tabs";
import {
  Field,
  StudioCard,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import { roleLabel } from "~/lib/roles";
import {
  studioProjectGhostButton,
  studioProjectPanel,
} from "~/lib/studio-project-surface";
import { appGhostButton, appNotificationCountBadgeSm } from "~/lib/surface";
import type { UserRole } from "~/server/db/schema";
import { ProjectActivityFeed } from "~/components/projects/project-activity-feed";
import { ProjectDeliverablesPanel } from "~/components/projects/project-deliverables-panel";
import { ProjectMilestonesPanel } from "~/components/projects/project-milestones-panel";
import {
  assignProjectMember,
  createProjectUpdate,
  removeProjectMember,
  setProjectRequestStatus,
  updateProject,
} from "~/server/studio/actions";
import type { getProjectById } from "~/server/studio/queries";

type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectById>>>;
type Person = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
};
type Technology = { id: string; name: string; category: string };
type Client = { id: string; name: string };

export function ProjectWorkspace({
  detail,
  team,
  technologies,
  clients,
  assignableTeam,
  isManager,
  isMember,
  founder,
}: {
  detail: ProjectDetail;
  team: Person[];
  technologies: Technology[];
  clients: Client[];
  assignableTeam: Person[];
  isManager: boolean;
  isMember: boolean;
  founder: boolean;
}) {
  const { project } = detail;
  const openRequests = detail.requests.filter(
    (request) => request.status === "open",
  ).length;
  const isPublic =
    project.status === "published" || project.status === "completed";
  const projectPath = `/studio/projects/${project.id}`;
  const canPublishToClient = founder || isManager;
  const completedMilestones = detail.milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const milestoneProgress =
    detail.milestones.length > 0
      ? Math.round((completedMilestones / detail.milestones.length) * 100)
      : null;

  const overviewPanel = (
    <div className="space-y-6">
      <div className={`flex flex-wrap gap-2 p-4 ${studioProjectPanel}`}>
        {isManager ? (
          <Link
            href={`${projectPath}?tab=edit`}
            className="hover:bg-sc-accent inline-flex items-center gap-1.5 rounded-md bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
          >
            <Pencil className="size-3" />
            Edit project
          </Link>
        ) : null}
        {isPublic ? (
          <Link
            href={`/work/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
          >
            <ExternalLink className="size-3" />
            View public page
          </Link>
        ) : null}
        <Link
          href={`${projectPath}?tab=updates`}
          className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
        >
          Updates
          <ArrowRight className="size-3" />
        </Link>
        <Link
          href={`${projectPath}?tab=milestones`}
          className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
        >
          Milestones
          <ArrowRight className="size-3" />
        </Link>
        <Link
          href={`${projectPath}?tab=deliverables`}
          className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
        >
          Files
          <ArrowRight className="size-3" />
        </Link>
        <Link
          href={`${projectPath}?tab=requests`}
          className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
        >
          Requests
          {openRequests > 0 ? (
            <span className={appNotificationCountBadgeSm}>{openRequests}</span>
          ) : null}
          <ArrowRight className="size-3" />
        </Link>
        {isManager ? (
          <Link
            href={`${projectPath}?tab=team`}
            className={`inline-flex items-center gap-1.5 ${studioProjectGhostButton}`}
          >
            Team
            <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StudioCard title="Lead">
          <p className="text-sm font-semibold">
            {detail.members.find((member) => member.projectRole === "lead")
              ?.name ?? "Unassigned — founder gets email"}
          </p>
        </StudioCard>
        <StudioCard title="Public status">
          <p className="text-sm font-semibold capitalize">{project.status}</p>
          {isManager ? (
            <p className="mt-2 text-[11px] leading-snug text-[#6f6a60]">
              Change in{" "}
              <Link
                href={`${projectPath}?tab=edit`}
                className="text-sc-accent font-bold hover:underline"
              >
                Edit → Publishing
              </Link>
              .
            </p>
          ) : null}
        </StudioCard>
        <StudioCard title="Client">
          <p className="text-sm font-semibold">{project.clientName || "—"}</p>
        </StudioCard>
        <StudioCard title="Technologies">
          <p className="text-sm font-semibold">
            {detail.technologies
              .map((technology) => technology.name)
              .join(", ") || "None"}
          </p>
        </StudioCard>
      </div>

      <StudioCard title="Summary">
        <p className="text-sm leading-relaxed text-[#57524a]">
          {project.summary || "No summary yet."}
        </p>
      </StudioCard>

      {milestoneProgress !== null ? (
        <StudioCard title="Milestone progress">
          <p className="text-2xl font-black tracking-tight">
            {milestoneProgress}%
          </p>
          <p className="mt-1 text-xs text-[#6f6a60]">
            {completedMilestones} of {detail.milestones.length} completed
          </p>
        </StudioCard>
      ) : null}

      <StudioCard title="Recent activity">
        <ProjectActivityFeed items={detail.activity.slice(0, 6)} />
      </StudioCard>

      {detail.updates[0] ? (
        <StudioCard title="Latest update">
          <p className="text-sm font-semibold">{detail.updates[0].title}</p>
          {detail.updates[0].body ? (
            <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-[#57524a]">
              {detail.updates[0].body}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-[#9a9488]">
            {detail.updates[0].authorName ?? "Studio"} ·{" "}
            {new Date(detail.updates[0].createdAt).toLocaleString()}
          </p>
        </StudioCard>
      ) : null}
    </div>
  );

  const editPanel = isManager ? (
    <ProjectForm
      action={updateProject}
      project={project}
      team={team}
      technologies={technologies}
      clients={clients}
      technologyIds={detail.technologies.map((technology) => technology.id)}
      canChooseLead={false}
    />
  ) : (
    <StudioCard title="Project details">
      <p className="text-sm leading-relaxed text-[#57524a]">
        {project.summary}
      </p>
      <p className="mt-3 text-xs text-[#6f6a60]">
        Only project leads and founders can edit project settings.
      </p>
    </StudioCard>
  );

  const teamPanel = isManager ? (
    <div className="space-y-6">
      <StudioCard
        title="Visibility"
        description="Draft is hidden on the site. Published and completed are public. Completed unlocks the client review form."
      >
        <p className="text-sm font-semibold capitalize">
          Current status: {project.status}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[#6f6a60]">
          Update status, featured flag, cover, and permalink in{" "}
          <Link
            href={`${projectPath}?tab=edit`}
            className="text-sc-accent font-bold hover:underline"
          >
            Edit project → Publishing
          </Link>
          , then save changes.
        </p>
      </StudioCard>

      <StudioCard
        title="Project team"
        description={
          founder
            ? "The lead receives project email and controls the project."
            : "Add developers to work with you on this project."
        }
      >
        <ul className="divide-y divide-[#15130f]/10">
          {detail.members.length === 0 ? (
            <li className="py-3 text-sm text-[#6f6a60]">
              No team assigned yet.
            </li>
          ) : (
            detail.members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {member.name ?? member.email}
                  </p>
                  <p className="text-[11px] text-[#6f6a60]">
                    {member.projectRole} · {roleLabel(member.role)}
                  </p>
                </div>
                <form action={removeProjectMember}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="userId" value={member.userId} />
                  <button
                    type="submit"
                    className="text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>

        <form
          action={assignProjectMember}
          className="mt-4 grid gap-3 border-t border-[#15130f]/10 pt-4 sm:grid-cols-[1fr_0.7fr_auto]"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <StudioSelect name="userId" required>
            <option value="">Select person</option>
            {assignableTeam.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name ?? person.email}
              </option>
            ))}
          </StudioSelect>
          <StudioSelect name="projectRole" defaultValue="developer">
            <option value="developer">Developer</option>
            {founder ? <option value="lead">Lead (full control)</option> : null}
          </StudioSelect>
          <button
            type="submit"
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase"
          >
            Assign
          </button>
        </form>
      </StudioCard>
    </div>
  ) : (
    <StudioCard title="Team">
      <ul className="divide-y divide-[#15130f]/10">
        {detail.members.map((member) => (
          <li key={member.userId} className="py-3">
            <p className="text-sm font-semibold">
              {member.name ?? member.email}
            </p>
            <p className="text-[11px] text-[#6f6a60]">
              {member.projectRole} · {roleLabel(member.role)}
            </p>
          </li>
        ))}
      </ul>
    </StudioCard>
  );

  const updatesPanel = (
    <StudioCard
      title="Progress updates"
      description="Client-visible updates appear in the portal."
    >
      {detail.updates.length === 0 ? (
        <p className="text-sm text-[#6f6a60]">No updates yet.</p>
      ) : (
        <ul className="divide-y divide-[#15130f]/10">
          {detail.updates.map((update) => (
            <li key={update.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{update.title}</p>
                <span className="text-[10px] font-bold tracking-[0.1em] text-[#9a9488] uppercase">
                  {update.visibility}
                </span>
              </div>
              {update.body ? (
                <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-[#57524a]">
                  {update.body}
                </p>
              ) : null}
              <p className="mt-1 text-[10px] text-[#9a9488]">
                {update.authorName ?? "Studio"} ·{" "}
                {new Date(update.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isMember || founder ? (
        <form
          action={createProjectUpdate}
          className="mt-4 space-y-3 border-t border-[#15130f]/10 pt-4"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Update title">
            <StudioInput name="title" required />
          </Field>
          <Field label="Details">
            <StudioTextarea name="body" />
          </Field>
          <Field label="Visibility">
            <StudioSelect name="visibility" defaultValue="client">
              <option value="client">Client (portal)</option>
              <option value="internal">Internal only</option>
            </StudioSelect>
          </Field>
          <button
            type="submit"
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase"
          >
            Post update
          </button>
        </form>
      ) : null}
    </StudioCard>
  );

  const milestonesPanel = (
    <ProjectMilestonesPanel
      projectId={project.id}
      milestones={detail.milestones}
      canManage={isManager}
      isMember={isMember || founder}
    />
  );

  const deliverablesPanel = (
    <ProjectDeliverablesPanel
      projectId={project.id}
      deliverables={detail.deliverables}
      isMember={isMember || founder}
      canManage={isManager}
      canPublishToClient={canPublishToClient}
      audience="studio"
    />
  );

  const activityPanel = (
    <StudioCard
      title="Activity"
      description="Updates, requests, deliverables, and milestones."
    >
      <ProjectActivityFeed items={detail.activity} />
    </StudioCard>
  );

  const requestsPanel = (
    <StudioCard
      title="Client requests"
      description="Submitted from the portal. Project leads can mark requests completed or rejected."
    >
      {detail.requests.length === 0 ? (
        <p className="text-sm text-[#6f6a60]">No requests yet.</p>
      ) : (
        <ul className="divide-y divide-[#15130f]/10">
          {detail.requests.map((request) => (
            <li key={request.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{request.title}</p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] uppercase ${
                    request.status === "completed"
                      ? "text-[#2e7d32]"
                      : request.status === "rejected"
                        ? "text-[#9a3b2e]"
                        : "text-[#6f6a60]"
                  }`}
                >
                  {request.status === "completed" ? (
                    <Check className="size-3" />
                  ) : null}
                  {request.status === "rejected" ? (
                    <X className="size-3" />
                  ) : null}
                  {request.status}
                </span>
              </div>
              {request.description ? (
                <p className="mt-1 text-xs whitespace-pre-wrap text-[#57524a]">
                  {request.description}
                </p>
              ) : null}
              {request.resolutionNote ? (
                <p
                  className={
                    request.status === "rejected"
                      ? "mt-2 border-l-2 border-[#9a3b2e]/40 pl-3 text-xs leading-relaxed text-[#9a3b2e]"
                      : "mt-2 border-l-2 border-[#2e7d32]/30 pl-3 text-xs leading-relaxed text-[#57524a]"
                  }
                >
                  <strong>
                    {request.status === "rejected"
                      ? "Rejected reason: "
                      : "Note: "}
                  </strong>
                  {request.resolutionNote}
                </p>
              ) : null}
              <p className="mt-1 text-[10px] text-[#9a9488]">
                {request.type} · {request.priority} ·{" "}
                {new Date(request.createdAt).toLocaleString()}
                {request.resolvedAt
                  ? ` · resolved ${new Date(request.resolvedAt).toLocaleString()}`
                  : ""}
              </p>

              {isManager ? (
                request.status === "rejected" ? (
                  <form action={setProjectRequestStatus} className="mt-3">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="status" value="open" />
                    <button type="submit" className={appGhostButton}>
                      Reopen request
                    </button>
                  </form>
                ) : request.status === "open" ? (
                  <div className="mt-3 grid gap-3 border-t border-[#15130f]/10 pt-3">
                    <form action={setProjectRequestStatus}>
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 bg-[#2e7d32] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-[#256428]"
                      >
                        <Check className="size-3" /> Mark completed
                      </button>
                    </form>
                    <form
                      action={setProjectRequestStatus}
                      className="grid gap-2"
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <input type="hidden" name="status" value="rejected" />
                      <StudioTextarea
                        name="resolutionNote"
                        placeholder="Why is this request being rejected?"
                        required
                      />
                      <button
                        type="submit"
                        className="inline-flex w-fit items-center gap-1 rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase shadow-[0_1px_2px_rgba(154,59,46,0.15)] hover:shadow-[0_2px_8px_rgba(154,59,46,0.2)]"
                      >
                        <X className="size-3" /> Reject request
                      </button>
                    </form>
                  </div>
                ) : null
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </StudioCard>
  );

  const tabs = isManager
    ? [
        {
          id: "edit",
          label: "Edit project",
          panel: editPanel,
        },
        { id: "overview", label: "Overview", panel: overviewPanel },
        { id: "team", label: "Team", panel: teamPanel },
        { id: "activity", label: "Activity", panel: activityPanel },
        { id: "milestones", label: "Milestones", panel: milestonesPanel },
        { id: "deliverables", label: "Files", panel: deliverablesPanel },
        { id: "updates", label: "Updates", panel: updatesPanel },
        {
          id: "requests",
          label: "Requests",
          panel: requestsPanel,
          badge: openRequests,
        },
      ]
    : [
        { id: "overview", label: "Overview", panel: overviewPanel },
        {
          id: "edit",
          label: "Details",
          panel: editPanel,
        },
        { id: "activity", label: "Activity", panel: activityPanel },
        { id: "milestones", label: "Milestones", panel: milestonesPanel },
        { id: "deliverables", label: "Files", panel: deliverablesPanel },
        { id: "updates", label: "Updates", panel: updatesPanel },
        {
          id: "requests",
          label: "Requests",
          panel: requestsPanel,
          badge: openRequests,
        },
      ];

  return (
    <StudioTabs items={tabs} defaultTab={isManager ? "edit" : "overview"} />
  );
}
