import Link from "next/link";
import { StudioProjectsFilters } from "~/components/studio/projects-filters";
import { StudioProjectsList } from "~/components/studio/projects-list";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { filterStudioProjects } from "~/lib/studio-projects-filter";
import { canCreateProjects, roleLabel } from "~/lib/roles";
import { studioProjectPanel } from "~/lib/studio-project-surface";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { paginateStudio, parseStudioPage, studioPageSummary } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";
import { getStudioProjects } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function StudioProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; view?: string; page?: string }>;
}) {
  const { q = "", status = "all", view: viewParam, page: pageParam } = await searchParams;
  const view = parseStudioView(viewParam);
  const page = parseStudioPage(pageParam);
  const session = await auth();
  const canCreate = canCreateProjects(session?.user.role);
  const allProjects = await getStudioProjects(canCreate ? undefined : session?.user.id);
  const projects = filterStudioProjects(allProjects, q, status);
  const paginated = paginateStudio(projects, page);
  const hasFilters = Boolean(q.trim()) || status !== "all";

  return (
    <div>
      <StudioHeader
        title="Projects"
        description={
          canCreate
            ? "Create projects, assign a lead or developer, and control what is published to the public site."
            : "Projects assigned to you. Project leads can edit their project and add developers."
        }
        actions={
          canCreate ? (
            <Link
              href="/studio/projects/new"
              className="inline-flex items-center rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
            >
              New project
            </Link>
          ) : null
        }
      />

      <StudioProjectsFilters />

      <p className="mb-4 text-xs text-[#6f6a60]">
        {paginated.total} of {allProjects.length}{" "}
        {allProjects.length === 1 ? "project" : "projects"}
        {hasFilters ? " matching filters" : ""}
        {paginated.total > 0
          ? ` · ${studioPageSummary(paginated.page, paginated.pageSize, paginated.total)}`
          : ""}
      </p>

      {allProjects.length === 0 ? (
        <p className={`px-4 py-8 text-sm text-[#6f6a60] ${studioProjectPanel}`}>
          {canCreate
            ? "No projects yet. Create one or import the current portfolio from the overview."
            : "No projects have been assigned to you yet."}
        </p>
      ) : paginated.total === 0 ? (
        <p className={`px-4 py-8 text-sm text-[#6f6a60] ${studioProjectPanel}`}>
          No projects match your filters.{" "}
          <Link href="/studio/projects" className="font-semibold text-sc-accent hover:underline">
            Clear filters
          </Link>
        </p>
      ) : (
        <>
          <StudioProjectsList projects={paginated.items} view={view} />
          <StudioPagination page={paginated.page} totalPages={paginated.totalPages} />
        </>
      )}

      <p className="mt-4 text-xs text-[#6f6a60]">
        Your role: {roleLabel(session?.user.role)}.{" "}
        {canCreate
          ? "Founders can create projects and see every project."
          : "You only see projects assigned to you. Project leads can edit their projects and add developers."}
      </p>
    </div>
  );
}
