import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder, roleLabel } from "~/lib/roles";
import { createTeamMember, updateUserRole } from "~/server/studio/actions";
import { getPendingInvites } from "~/server/invites";
import { getTeamUsers } from "~/server/studio/queries";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
} from "~/components/studio/ui";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  validation: "Check the name and email, then try again.",
  exists: "That email already has an account.",
  self: "You cannot change your own role.",
  "last-founder": "The studio needs at least one founder.",
  email:
    "Invitation saved, but the email could not be sent. Check the Google SMTP settings.",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { invited, error } = await searchParams;
  const [team, pendingInvites] = await Promise.all([
    getTeamUsers(),
    getPendingInvites(),
  ]);
  const pending = pendingInvites.filter((invite) => invite.role !== "client");
  const message = invited
    ? "Invitation sent."
    : error
      ? ERROR_MESSAGES[error]
      : null;

  return (
    <div>
      <StudioHeader
        title="Team"
        description="Founder inherits every role. Leads inherit developers. Developers only see their assigned projects."
        actions={
          <Link
            href="/studio/technologies"
            className="inline-flex border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-[#b8770a]"
          >
            Technologies
          </Link>
        }
      />

      {message ? (
        <p
          className={
            invited
              ? "mb-6 border border-[#b8770a]/30 bg-[#b8770a]/5 px-4 py-3 text-sm text-[#7a4e05]"
              : "mb-6 border border-[#b3261e]/30 bg-[#b3261e]/5 px-4 py-3 text-sm text-[#b3261e]"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <StudioCard
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
              className="w-fit bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              Send invitation
            </button>
          </form>
        </StudioCard>

        <StudioCard title="Team members">
          <ul className="divide-y divide-[#15130f]/10">
            {team.map((person) => (
              <li key={person.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {person.name ?? person.email}
                      {person.id === session?.user.id ? (
                        <span className="ml-2 text-[10px] font-bold tracking-[0.12em] text-[#b8770a] uppercase">
                          You
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-[#6f6a60]">
                      {person.email} · {person.title ?? roleLabel(person.role)}
                    </p>
                  </div>
                  <span className="border border-[#15130f]/15 px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase">
                    {roleLabel(person.role)}
                  </span>
                </div>

                {person.id !== session?.user.id ? (
                  <form
                    action={updateUserRole}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="userId" value={person.id} />
                    <StudioSelect
                      name="role"
                      defaultValue={roleLabel(person.role).toLowerCase()}
                      className="max-w-44"
                    >
                      <option value="developer">Developer</option>
                      <option value="lead">Lead</option>
                      <option value="founder">Founder</option>
                      <option value="client">Client</option>
                    </StudioSelect>
                    <button
                      type="submit"
                      className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                    >
                      Update role
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </StudioCard>
      </div>

      {pending.length > 0 ? (
        <StudioCard
          title={`Pending invitations (${pending.length})`}
          className="mt-6"
        >
          <ul className="divide-y divide-[#15130f]/10">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {invite.name ?? invite.email}
                  </p>
                  <p className="text-[11px] text-[#6f6a60]">
                    {invite.email} · {roleLabel(invite.role)}
                    {invite.title ? ` · ${invite.title}` : ""}
                  </p>
                </div>
                <p className="text-[11px] text-[#9a9488]">
                  Expires{" "}
                  {invite.expiresAt.toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </StudioCard>
      ) : null}
    </div>
  );
}
