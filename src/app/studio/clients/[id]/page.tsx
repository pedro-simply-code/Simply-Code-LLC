import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CancelInviteForm } from "~/components/studio/cancel-invite-form";
import { StudioFormDialog } from "~/components/studio/studio-form-dialog";
import { Field, StudioCard, StudioHeader, StudioInput } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { addClientMember, updateClient } from "~/server/studio/actions";
import { getClientDetail } from "~/server/studio/queries";
import { appGhostButton, appGhostButtonLg, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string; invited?: string; error?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { id } = await params;
  const query = await searchParams;
  const client = await getClientDetail(id);
  if (!client) notFound();

  const returnTo = `/studio/clients/${id}`;

  return (
    <div>
      <StudioHeader
        title={client.name}
        description="Organization record, portal access, and linked studio projects."
        actions={
          <Link href="/studio/clients" className={appGhostButton}>
            All organizations
          </Link>
        }
      />

      {query.created === "1" ? (
        <p className="mb-4 rounded-md bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Organization created. Invite someone below to open the client portal.
        </p>
      ) : null}
      {query.saved === "1" ? (
        <p className="mb-4 rounded-md bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Organization updated.
        </p>
      ) : null}
      {query.invited === "1" ? (
        <p className="mb-4 rounded-md bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Portal invitation sent.
        </p>
      ) : null}
      {query.error === "email" ? (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-[#9a3b2e]">
          Could not send invitation email. Check SMTP settings.
        </p>
      ) : null}
      {query.error === "member" ? (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-[#9a3b2e]">
          Could not add that portal user. Check the email address.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <StudioCard title="Company details" description="Internal label and primary contact.">
            <form action={updateClient} className="grid gap-4">
              <input type="hidden" name="clientId" value={client.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Field label="Organization name">
                <StudioInput name="name" required defaultValue={client.name} maxLength={160} />
              </Field>
              <Field label="Contact email" hint="Billing or main point of contact (not portal login).">
                <StudioInput
                  name="contactEmail"
                  type="email"
                  defaultValue={client.contactEmail ?? ""}
                  placeholder="hello@client.com"
                />
              </Field>
              <button
                type="submit"
                className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
              >
                Save details
              </button>
            </form>
          </StudioCard>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <StudioCard
            title="Portal access"
            description="People who can sign in to the client portal for this organization."
          >
            <div className="mb-4 flex justify-end">
              <StudioFormDialog
                triggerLabel="Invite user"
                title="Invite to portal"
                description="New emails receive an invitation. Existing users are linked and get the client role when appropriate."
                triggerVariant="ghost"
              >
                <form action={addClientMember} className="grid gap-4">
                  <input type="hidden" name="clientId" value={client.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <Field label="Email">
                    <StudioInput name="email" type="email" required placeholder="name@company.com" />
                  </Field>
                  <button
                    type="submit"
                    className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
                  >
                    Send invitation
                  </button>
                </form>
              </StudioFormDialog>
            </div>
            {client.members.length === 0 && client.pendingInvites.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">No portal users yet. Send an invitation to get started.</p>
            ) : (
              <ul className="divide-y divide-[#15130f]/10">
                {client.members.map((member) => (
                  <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-semibold">{member.name ?? member.email}</p>
                      <p className="text-[11px] text-[#6f6a60]">{member.email}</p>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase">
                      Active
                    </span>
                  </li>
                ))}
                {client.pendingInvites.map((invite) => (
                  <li key={invite.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-semibold">{invite.email}</p>
                      <p className="text-[11px] text-[#6f6a60]">Invitation pending</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] text-[#9a9488]">
                        Expires{" "}
                        {invite.expiresAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                      <CancelInviteForm
                        inviteId={invite.id}
                        returnTo={returnTo}
                        email={invite.email}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StudioCard>

          <StudioCard title="Projects" description="Studio projects linked to this organization.">
            {client.projects.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">
                No linked projects. Assign this organization when editing a project.
              </p>
            ) : (
              <ul className={cn(appPanel, "divide-y divide-[#15130f]/10")}>
                {client.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/studio/projects/${project.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-sc-section-alt/40"
                    >
                      <span className="text-sm font-semibold">{project.title}</span>
                      <span className="text-[10px] font-bold tracking-[0.1em] text-[#9a9488] uppercase">
                        {project.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/studio/projects" className={cn(appGhostButtonLg, "mt-4 inline-flex")}>
              All projects
            </Link>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
