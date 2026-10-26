import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder, roleLabel } from "~/lib/roles";
import { createTeamMember } from "~/server/studio/actions";
import { getPendingInvites } from "~/server/invites";
import {
  getTeamUsers,
  getTechnologies,
  getTechnologyAssignmentsForUsers,
} from "~/server/studio/queries";
import { StudioFormDialog } from "~/components/studio/studio-form-dialog";
import { TeamMembersView } from "~/components/studio/team-members-view";
import { StudioViewToolbar } from "~/components/studio/studio-view-toggle";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
} from "~/components/studio/ui";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { paginateStudio, parseStudioPage, studioPageSummary } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";
import { CancelInviteForm } from "~/components/studio/cancel-invite-form";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{
    invited?: string;
    error?: string;
    updated?: string;
    view?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const query = await searchParams;
  const view = parseStudioView(query.view);
  const page = parseStudioPage(query.page);
  const returnParams = new URLSearchParams();
  if (view === "list") returnParams.set("view", "list");
  if (page > 1) returnParams.set("page", String(page));
  const returnTo = returnParams.size
    ? `/studio/team?${returnParams.toString()}`
    : "/studio/team";
  const [team, pendingInvites, technologyCatalog] = await Promise.all([
    getTeamUsers(),
    getPendingInvites(),
    getTechnologies(),
  ]);
  const assignmentsByUser = await getTechnologyAssignmentsForUsers(team.map((member) => member.id));
  const teamWithStack = team.map((member) => ({
    ...member,
    technologies: assignmentsByUser.get(member.id) ?? [],
  }));
  const pending = pendingInvites.filter((invite) => invite.role !== "client");
  const paginated = paginateStudio(teamWithStack, page);
  const catalogOptions = technologyCatalog.map((technology) => ({
    id: technology.id,
    name: technology.name,
    category: technology.category,
  }));

  return (
    <div>
      <StudioHeader
        title="Team"
        description="Roster cards show photo and role. Manage opens technology assignments (from the catalog), studio role, and About visibility."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StudioFormDialog
              triggerLabel="Invite member"
              title="Invite team member"
              description="Sends an email invitation. The recipient sets their own password. Public registration is closed."
            >
              <form action={createTeamMember} className="grid gap-4">
                <Field label="Name">
                  <StudioInput name="name" required maxLength={120} />
                </Field>
                <Field label="Email">
                  <StudioInput name="email" type="email" required />
                </Field>
                <Field label="Title">
                  <StudioInput
                    name="title"
                    placeholder="Full Stack Developer"
                    maxLength={120}
                  />
                </Field>
                <Field label="Role">
                  <StudioSelect name="role" defaultValue="developer">
                    <option value="developer">Developer</option>
                    <option value="lead">Lead (lead + developer)</option>
                    <option value="founder">Founder (all permissions)</option>
                  </StudioSelect>
                </Field>
                <button
                  type="submit"
                  className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
                >
                  Send invitation
                </button>
              </form>
            </StudioFormDialog>
            <Link href="/studio/technologies" className={cn("inline-flex", appGhostButtonLg)}>
              Technologies
            </Link>
          </div>
        }
      />

      {query.updated === "1" ? (
        <p className="mb-4 rounded-md bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Team member updated.
        </p>
      ) : null}
      {query.error === "self" ? (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-[#9a3b2e]">
          You cannot change your own role here. Ask another founder or use Profile for your details.
        </p>
      ) : null}
      {query.error === "last-founder" ? (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-[#9a3b2e]">
          At least one founder must remain in the studio.
        </p>
      ) : null}

      <StudioViewToolbar
        summary={<span className="font-semibold text-[#15130f]">{team.length} team members</span>}
        pageSummary={studioPageSummary(paginated.page, paginated.pageSize, paginated.total)}
      />
      <TeamMembersView
        team={paginated.items}
        currentUserId={session!.user.id}
        view={view}
        returnTo={returnTo}
        technologyCatalog={catalogOptions}
        canManageAbout={isFounder(session!.user.role)}
      />
      <StudioPagination page={paginated.page} totalPages={paginated.totalPages} />

      {pending.length > 0 ? (
        <StudioCard title={`Pending invitations (${pending.length})`} className="mt-6">
          <ul className="divide-y divide-[#15130f]/10">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{invite.name ?? invite.email}</p>
                  <p className="text-[11px] text-[#6f6a60]">
                    {invite.email} · {roleLabel(invite.role)}
                    {invite.title ? ` · ${invite.title}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[11px] text-[#9a9488]">
                    Expires{" "}
                    {invite.expiresAt.toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                  <CancelInviteForm
                    inviteId={invite.id}
                    returnTo={returnTo}
                    email={invite.email}
                  />
                </div>
              </li>
            ))}
          </ul>
        </StudioCard>
      ) : null}
    </div>
  );
}
