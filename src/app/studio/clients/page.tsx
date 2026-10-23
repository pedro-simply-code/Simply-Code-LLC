import { redirect } from "next/navigation";
import { Field, StudioHeader, StudioInput } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { createClient } from "~/server/studio/actions";
import { getClientsOverview } from "~/server/studio/queries";
import { ClientsListView } from "~/components/studio/clients-list-view";
import { StudioFormDialog } from "~/components/studio/studio-form-dialog";
import { StudioViewToolbar } from "~/components/studio/studio-view-toggle";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { paginateStudio, parseStudioPage, studioPageSummary } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { view: viewParam, page: pageParam } = await searchParams;
  const view = parseStudioView(viewParam);
  const page = parseStudioPage(pageParam);
  const clients = await getClientsOverview();
  const paginated = paginateStudio(clients, page);

  return (
    <div>
      <StudioHeader
        title="Clients"
        description={
          "Organizations (companies) with optional portal users and linked projects. " +
          "Create an organization first, then open it to invite portal access — separate from contact form enquiries."
        }
        actions={
          <StudioFormDialog
            triggerLabel="New organization"
            title="New client organization"
            description="Adds a company record. You will invite portal users on the next screen."
          >
            <form action={createClient} className="grid gap-4">
              <Field label="Organization name">
                <StudioInput name="name" required placeholder="Acme Inc." />
              </Field>
              <Field label="Contact email" hint="Optional — billing or main contact, not portal login.">
                <StudioInput name="contactEmail" type="email" placeholder="hello@acme.com" />
              </Field>
              <button
                type="submit"
                className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
              >
                Create & continue
              </button>
            </form>
          </StudioFormDialog>
        }
      />

      <StudioViewToolbar
        summary={
          <span className="font-semibold text-[#15130f]">
            {clients.length} {clients.length === 1 ? "organization" : "organizations"}
          </span>
        }
        pageSummary={studioPageSummary(paginated.page, paginated.pageSize, paginated.total)}
      />
      <ClientsListView clients={paginated.items} view={view} />
      <StudioPagination page={paginated.page} totalPages={paginated.totalPages} />
    </div>
  );
}
