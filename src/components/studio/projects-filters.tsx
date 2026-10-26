"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { appInputOnMuted } from "~/lib/surface";
import { StudioViewToggle } from "~/components/studio/studio-view-toggle";
import {
  studioProjectGhostButton,
  studioProjectPanel,
} from "~/lib/studio-project-surface";

function StudioProjectsFiltersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const [draftQ, setDraftQ] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = draftQ ?? urlQ;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const pushParams = (nextQ: string, nextStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    const q = nextQ.trim();
    if (q) params.set("q", q);
    else params.delete("q");
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    else params.delete("status");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasFilters = Boolean(query.trim()) || status !== "all";

  return (
    <div
      className={`mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between ${studioProjectPanel}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="grid min-w-0 flex-1 gap-1.5 sm:min-w-[200px]">
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setDraftQ(value);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                setDraftQ(null);
                const params = new URLSearchParams(window.location.search);
                const currentStatus = params.get("status") ?? "all";
                pushParams(value, currentStatus);
              }, 300);
            }}
            placeholder="Title, slug, client, stack…"
            className={appInputOnMuted}
          />
        </label>
        <label className="grid gap-1.5 sm:w-44">
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            Status
          </span>
          <select
            value={status}
            onChange={(event) => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setDraftQ(null);
              pushParams(query, event.target.value);
            }}
            className={appInputOnMuted}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        {hasFilters ? (
          <Link
            href={pathname}
            onClick={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setDraftQ(null);
            }}
            className={`inline-flex items-center px-4 py-2 sm:mb-0.5 ${studioProjectGhostButton}`}
          >
            Clear
          </Link>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center sm:mb-0.5">
        <StudioViewToggle />
      </div>
    </div>
  );
}

export function StudioProjectsFilters() {
  return (
    <Suspense
      fallback={
        <div
          className={`mb-6 h-[88px] p-4 text-sm text-[#6f6a60] ${studioProjectPanel}`}
        >
          Loading filters…
        </div>
      }
    >
      <StudioProjectsFiltersInner />
    </Suspense>
  );
}
