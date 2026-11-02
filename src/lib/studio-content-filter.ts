import type { StudioContentRow } from "~/components/studio/content-list";

export function filterStudioContent(
  entries: StudioContentRow[],
  query: string,
  kind: string,
  status: string,
): StudioContentRow[] {
  const q = query.trim().toLowerCase();
  let rows = entries;

  if (kind && kind !== "all") {
    rows = rows.filter((entry) => entry.kind === kind);
  }

  if (status && status !== "all") {
    rows = rows.filter((entry) => entry.status === status);
  }

  if (!q) return rows;

  return rows.filter((entry) => {
    const haystack = [entry.title, entry.slug, entry.excerpt].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}
