"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, type ReactNode } from "react";
import { appNotificationCountBadgeSm } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type StudioTabItem = {
  id: string;
  label: string;
  panel: ReactNode;
  badge?: number;
};

function StudioTabsInner({
  items,
  defaultTab,
}: {
  items: StudioTabItem[];
  defaultTab?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fallback = defaultTab ?? items[0]?.id ?? "";
  const tabParam = searchParams.get("tab");
  const active =
    tabParam && items.some((item) => item.id === tabParam) ? tabParam : fallback;

  const setActive = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === fallback) {
        params.delete("tab");
      } else {
        params.set("tab", id);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, fallback],
  );

  if (items.length === 0) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project sections"
        className="mb-6 flex gap-0 overflow-x-auto overflow-y-hidden border-b border-[#15130f]/12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "relative -mb-px shrink-0 px-4 py-2.5 text-[10px] font-bold tracking-[0.14em] uppercase transition-colors",
              active === item.id
                ? "text-[#15130f] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-sc-accent"
                : "text-[#9a9488] hover:text-[#57524a]",
            )}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 ? (
              <span className={cn(appNotificationCountBadgeSm, "ml-1.5")}>
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.id} role="tabpanel" hidden={active !== item.id}>
          {item.panel}
        </div>
      ))}
    </div>
  );
}

export function StudioTabs(props: { items: StudioTabItem[]; defaultTab?: string }) {
  return (
    <Suspense
      fallback={
        <div className="mb-6 h-10 border-b border-[#15130f]/12 text-sm text-[#6f6a60]">Loading…</div>
      }
    >
      <StudioTabsInner {...props} />
    </Suspense>
  );
}
