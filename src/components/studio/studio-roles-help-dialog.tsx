"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { appGhostButtonLg } from "~/lib/surface";

export function StudioRolesHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={appGhostButtonLg}>
          Roles & access
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-white shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            How routing works
          </DialogTitle>
          <DialogDescription className="text-sm text-[#57524a]">
            Roles inherit downwards: founder → lead → developer.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm leading-relaxed text-[#57524a]">
          <li>
            <strong className="text-[#15130f]">Founder</strong> manages team,
            technologies, clients, projects and reviews.
          </li>
          <li>
            <strong className="text-[#15130f]">Lead</strong> only sees assigned
            projects. They can edit projects they lead and add developers, but
            cannot create projects or manage reviews.
          </li>
          <li>
            <strong className="text-[#15130f]">Developer</strong> sees their
            assigned projects; project email goes to the lead or founder.
          </li>
          <li>
            <strong className="text-[#15130f]">Client</strong> uses the portal
            only.
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
