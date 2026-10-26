import type { ReactNode } from "react";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

/** Shared shell so overview columns stretch to equal height. */
export function StudioOverviewColumn({
  title,
  description,
  footer,
  children,
  className,
}: {
  title: string;
  description?: string;
  footer: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(appPanel, "flex h-full min-w-0 flex-col p-5", className)}
    >
      <div className="mb-4 min-w-0">
        <h2 className="text-[12px] font-bold tracking-[0.16em] uppercase">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[#6f6a60]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-start">
        {children}
      </div>
      <div className="mt-auto shrink-0 pt-4">{footer}</div>
    </section>
  );
}

/** Grid from `sm` up; pair with `overviewPreviewListMobileOnlyClass` when view is grid. */
export const overviewPreviewGridClass =
  "hidden h-full min-h-0 flex-1 auto-rows-fr grid-cols-2 grid-rows-2 gap-3 sm:grid";

export const overviewPreviewListClass =
  "flex min-h-0 flex-1 flex-col divide-y divide-[#15130f]/10";

/** List on mobile when overview view is grid (desktop uses grid). */
export const overviewPreviewListMobileOnlyClass =
  "flex min-h-0 flex-1 flex-col divide-y divide-[#15130f]/10 sm:hidden";

export const overviewPreviewListItemClass =
  "flex min-h-0 flex-1 flex-col justify-center py-3";

export const overviewPreviewSlotsShellClass =
  "relative flex min-h-0 flex-1 flex-col";
