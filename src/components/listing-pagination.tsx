"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function ListingPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn(
        "mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#15130f]/8 pt-6",
        className,
      )}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
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
        onClick={() => onPageChange(page + 1)}
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
