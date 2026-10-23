"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

function StudioPaginationInner({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#15130f]/8 pt-4"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        className={cn(
          "inline-flex items-center gap-1",
          appGhostButtonLg,
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="size-3.5" />
        Previous
      </button>
      <span className="text-[11px] font-semibold tracking-wide text-[#6f6a60]">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
        className={cn(
          "inline-flex items-center gap-1",
          appGhostButtonLg,
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}

export function StudioPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  return (
    <Suspense fallback={null}>
      <StudioPaginationInner page={page} totalPages={totalPages} />
    </Suspense>
  );
}
