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
            triggerVariant === "ghost" ? appGhostButtonLg : appPrimaryButtonStudio,
          )}
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,720px)] overflow-y-auto border-0 bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-md",
          contentClassName,
        )}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
