import { redirect } from "next/navigation";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
} from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder, roleLabel } from "~/lib/roles";
import { getPendingInvites } from "~/server/invites";
import { addClientMember, createClient } from "~/server/studio/actions";
import { getClientsWithMembers } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  name: "Enter a company name.",
  member: "Enter a valid client email.",
  email:
    "Invitation saved, but the email could not be sent. Check the Google SMTP settings.",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { invited, error } = await searchParams;
  const [clients, pendingInvites] = await Promise.all([
    getClientsWithMembers(),
    getPendingInvites(),
  ]);
  const pending = pendingInvites.filter((invite) => invite.role === "client");
  const message = invited
    ? "Invitation sent."
    : error
      ? ERROR_MESSAGES[error]
      : null;

  return (
    <div>
      <StudioHeader
        title="Clients"
        description="Client accounts unlock the portal. Add an existing login or invite a new client by email."
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
        <StudioCard title="Create client">
          <form action={createClient} className="grid gap-4">
            <Field label="Company name">
              <StudioInput name="name" required />
            </Field>
            <Field label="Contact email">
              <StudioInput name="contactEmail" type="email" />
            </Field>
            <button
              type="submit"
              className="w-fit bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              Create client
            </button>
          </form>
        </StudioCard>

        <StudioCard title={`Client accounts (${clients.length})`}>
          <ul className="divide-y divide-[#15130f]/10">
            {clients.length === 0 ? (
              <li className="py-4 text-sm text-[#6f6a60]">
                No client accounts yet.
              </li>
            ) : (
              clients.map((client) => (
                <li key={client.id} className="py-4">
                  <p className="text-sm font-semibold">{client.name}</p>
                  <p className="text-[11px] text-[#6f6a60]">
                    {client.contactEmail ?? "No contact email"}
                  </p>

                  {client.members.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {client.members.map((member) => (
                        <li
                          key={member.userId}
                          className="border border-[#15130f]/15 px-2.5 py-1 text-[11px]"
                        >
                          {member.name ?? member.email}{" "}
                          <span className="text-[#9a9488]">
                            ({roleLabel(member.role)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <form
                    action={addClientMember}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="clientId" value={client.id} />
                    <StudioInput
                      name="email"
                      type="email"
                      placeholder="client@company.com"
                      className="max-w-72"
                      required
                    />
                    <label className="flex items-center gap-2 py-2 text-[11px] text-[#57524a]">
                      <input type="checkbox" name="makeClient" />
                      Set role to client
                    </label>
                    <button
                      type="submit"
                      className="border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                    >
                      Add or invite
                    </button>
                  </form>
                  <p className="mt-1 text-[11px] text-[#9a9488]">
                    If the email has no account, we&apos;ll send a portal
                    invitation.
                  </p>
                </li>
              ))
            )}
          </ul>
        </StudioCard>
      </div>

      {pending.length > 0 ? (
        <StudioCard
          title={`Pending client invitations (${pending.length})`}
          className="mt-6"
        >
          <ul className="divide-y divide-[#15130f]/10">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{invite.email}</p>
                  <p className="text-[11px] text-[#6f6a60]">
                    {invite.clientName ?? "Client portal"} · invited by{" "}
                    {invite.invitedByName ?? "the studio"}
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
