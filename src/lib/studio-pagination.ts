/** ~3 rows on a 3–4 column grid, or a compact list page. */
export const STUDIO_PAGE_SIZE = 10;

/** Studio overview columns (recent projects, attention, activity). */
export const STUDIO_OVERVIEW_PREVIEW_SIZE = 4;

/** Pad overview previews to a fixed slot count (null = invisible placeholder). */
export function padStudioOverviewPreview<T>(
  items: T[],
  size = STUDIO_OVERVIEW_PREVIEW_SIZE,
): (T | null)[] {
  const slots: (T | null)[] = items.slice(0, size);
  while (slots.length < size) {
    slots.push(null);
  }
  return slots;
}

export function parseStudioPage(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function paginateStudio<T>(
  items: T[],
  page: number,
  pageSize = STUDIO_PAGE_SIZE,
) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    pageSize,
  };
}

export function studioPageSummary(
  page: number,
  pageSize: number,
  total: number,
): string | null {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}–${end} of ${total}`;
}
