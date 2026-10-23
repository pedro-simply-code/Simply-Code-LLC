import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { createTechnology } from "~/server/studio/actions";
import { getTechnologies } from "~/server/studio/queries";
import { StudioFormDialog } from "~/components/studio/studio-form-dialog";
import { Field, StudioHeader, StudioInput } from "~/components/studio/ui";
import { TechnologiesCatalogView } from "~/components/studio/technologies-catalog-view";
import { StudioViewToolbar } from "~/components/studio/studio-view-toggle";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { paginateStudio, parseStudioPage, studioPageSummary } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const dynamic = "force-dynamic";

export default async function TechnologiesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const { view: viewParam, page: pageParam } = await searchParams;
  const view = parseStudioView(viewParam);
  const page = parseStudioPage(pageParam);

  const technologies = await getTechnologies();
  const paginatedTech = paginateStudio(technologies, page);

  return (
    <div>
      <StudioHeader
        title="Technologies"
        description="Stack catalog for projects and team skills. Assign people to technologies in Studio → Team → Manage."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StudioFormDialog
              triggerLabel="Add technology"
              title="Add technology"
              description="Name and category appear when assigning stack to projects and people."
            >
              <form action={createTechnology} className="grid gap-4">
                <Field label="Name">
                  <StudioInput name="name" placeholder="Python" required />
                </Field>
                <Field label="Category">
                  <StudioInput name="category" placeholder="Backend" />
                </Field>
                <button
                  type="submit"
                  className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
                >
                  Add technology
                </button>
              </form>
            </StudioFormDialog>
            <a href="/studio/team" className={cn("inline-flex", appGhostButtonLg)}>
              Assign on Team
            </a>
          </div>
        }
      />

      <StudioViewToolbar
        summary={
          <span className="font-semibold text-[#15130f]">{technologies.length} technologies</span>
        }
        pageSummary={studioPageSummary(
          paginatedTech.page,
          paginatedTech.pageSize,
          paginatedTech.total,
        )}
      />
      <TechnologiesCatalogView technologies={paginatedTech.items} view={view} />
      <StudioPagination page={paginatedTech.page} totalPages={paginatedTech.totalPages} />
    </div>
  );
}
