"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { PerfectScrollArea } from "~/components/perfect-scroll-area";
import { appGhostButtonLg, appPrimaryButtonStudio } from "~/lib/surface";
import { cn } from "~/lib/utils";

type StudioFormDialogProps = {
  triggerLabel: string;
  title: string;
  description?: string;
  triggerVariant?: "primary" | "ghost";
  contentClassName?: string;
  children: ReactNode;
};

export function StudioFormDialog({
  triggerLabel,
  title,
  description,
  triggerVariant = "primary",
  contentClassName,
  children,
}: StudioFormDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            triggerVariant === "ghost"
              ? appGhostButtonLg
              : appPrimaryButtonStudio,
          )}
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-md",
          contentClassName,
        )}
      >
        <DialogHeader className="shrink-0 pr-10 text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <PerfectScrollArea className="min-h-0 flex-1">
          <div className="pr-1">{children}</div>
        </PerfectScrollArea>
      </DialogContent>
    </Dialog>
  );
}
