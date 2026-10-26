"use client";

import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cancelPendingInvite } from "~/server/studio/actions";
import { appGhostButtonLg, appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function CancelInviteForm({
  inviteId,
  returnTo,
  email,
  className,
}: {
  inviteId: string;
  returnTo: string;
  email?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <div className={className}>
      <form id={formId} action={cancelPendingInvite} className="hidden">
        <input type="hidden" name="inviteId" value={inviteId} />
        <input type="hidden" name="returnTo" value={returnTo} />
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(appGhostButtonLg, "text-[10px] text-[#9a3b2e] hover:bg-red-50")}
          >
            Cancel invitation
          </button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md border-0 bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.14)]"
          showCloseButton
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
              Cancel invitation?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
              {email ? (
                <>
                  The invite for <strong className="font-semibold text-[#15130f]">{email}</strong>{" "}
                  will be removed. The link in the email will stop working, and you can send a new
                  invitation anytime.
                </>
              ) : (
                <>
                  The invitation link in the email will stop working. You can send a new invitation
                  anytime.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={appGhostButtonLg}
            >
              Keep invitation
            </button>
            <button
              type="submit"
              form={formId}
              className={cn(
                appPrimaryButtonStudioSubmit,
                "bg-[#9a3b2e] hover:bg-[#7a2f24]",
              )}
              onClick={() => setOpen(false)}
            >
              Yes, cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
