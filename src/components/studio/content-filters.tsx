"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { StudioViewToggle } from "~/components/studio/studio-view-toggle";
import {
  studioContentGhostButton,
  studioContentPanel,
} from "~/lib/studio-content-surface";
import { appInputOnMuted } from "~/lib/surface";

function StudioContentFiltersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const kind = searchParams.get("kind") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const [draftQ, setDraftQ] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = draftQ ?? urlQ;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const pushParams = (nextQ: string, nextKind: string, nextStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    const q = nextQ.trim();
    if (q) params.set("q", q);
    else params.delete("q");
    if (nextKind && nextKind !== "all") params.set("kind", nextKind);
    else params.delete("kind");
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    else params.delete("status");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasFilters =
    Boolean(query.trim()) || kind !== "all" || status !== "all";

  return (
    <div
      className={`mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between ${studioContentPanel}`}
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
                const currentKind = params.get("kind") ?? "all";
                const currentStatus = params.get("status") ?? "all";
                pushParams(value, currentKind, currentStatus);
              }, 300);
            }}
            placeholder="Title, slug, excerpt…"
            className={appInputOnMuted}
          />
        </label>
        <label className="grid gap-1.5 sm:w-40">
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            Type
          </span>
          <select
            value={kind}
            onChange={(event) => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setDraftQ(null);
              pushParams(query, event.target.value, status);
            }}
            className={appInputOnMuted}
          >
            <option value="all">All</option>
            <option value="page">Pages</option>
            <option value="post">Posts</option>
          </select>
        </label>
        <label className="grid gap-1.5 sm:w-40">
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            Status
          </span>
          <select
            value={status}
            onChange={(event) => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setDraftQ(null);
              pushParams(query, kind, event.target.value);
            }}
            className={appInputOnMuted}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        {hasFilters ? (
          <Link
            href={pathname}
            onClick={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setDraftQ(null);
            }}
            className={`inline-flex items-center px-4 py-2 sm:mb-0.5 ${studioContentGhostButton}`}
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

export function StudioContentFilters() {
  return (
    <Suspense
      fallback={
        <div
          className={`mb-6 h-[88px] p-4 text-sm text-[#6f6a60] ${studioContentPanel}`}
        >
          Loading filters…
        </div>
      }
    >
      <StudioContentFiltersInner />
    </Suspense>
  );
}
