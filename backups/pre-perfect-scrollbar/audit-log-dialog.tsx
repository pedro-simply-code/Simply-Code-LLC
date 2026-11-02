"use client";

import { History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { appGhostButtonLg } from "~/lib/surface";

type AuditRow = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date | string;
  actorName: string | null;
  actorEmail: string | null;
};

/**
 * Audit log lives in a dialog so the settings page stays short. The trigger
 * sits beside the page title and the list scrolls inside the modal.
 */
export function AuditLogDialog({ events }: { events: AuditRow[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`${appGhostButtonLg} inline-flex items-center gap-2`}
        >
          <History className="size-3.5" />
          Audit log
          {events.length > 0 ? (
            <span className="rounded-full bg-[#15130f] px-1.5 py-0.5 text-[9px] leading-none text-white">
              {events.length}
            </span>
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(85vh,640px)] flex-col gap-0 overflow-hidden border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-xl">
        <DialogHeader className="shrink-0 pr-10 text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            Audit log
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
            Recent security and administration events (last 50).
          </DialogDescription>
        </DialogHeader>

        {events.length === 0 ? (
          <p className="text-sm text-[#6f6a60]">No events recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#15130f]/10 overflow-y-auto pr-1">
            {events.map((event) => (
              <li key={event.id} className="py-3">
                <p className="text-sm font-semibold">{event.action}</p>
                <p className="mt-1 text-xs text-[#57524a]">
                  {event.actorName ?? event.actorEmail ?? "System"}
                  {event.entityType ? ` · ${event.entityType}` : ""}
                  {event.ipAddress ? ` · ${event.ipAddress}` : ""}
                </p>
                <p className="mt-1 text-[10px] text-[#9a9488]">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
