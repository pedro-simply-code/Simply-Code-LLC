import type { StudioProjectRow } from "~/components/studio/projects-list";

export function filterStudioProjects(
  projects: StudioProjectRow[],
  query: string,
  status: string,
): StudioProjectRow[] {
  const q = query.trim().toLowerCase();
  let rows = projects;

  if (status && status !== "all") {
    rows = rows.filter((project) => project.status === status);
  }

  if (!q) return rows;

  return rows.filter((project) => {
    const haystack = [
      project.title,
      project.slug,
      project.clientName,
      project.stackLabel,
      project.leadName ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
