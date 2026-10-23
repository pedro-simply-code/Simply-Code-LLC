"use client";

import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MultiSelect } from "~/components/studio/multi-select";
import { Field, StudioInput } from "~/components/studio/ui";
import type { UserRole } from "~/server/db/schema";
import {
  assignUserTechnology,
  removeUserTechnology,
  updateTeamMember,
} from "~/server/studio/actions";
import { roleLabel, normalizeRole } from "~/lib/roles";
import { appChip, appGhostButtonLg, appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";

const STUDIO_ROLES: UserRole[] = ["developer", "lead", "founder", "client"];

type TechnologyOption = {
  id: string;
  name: string;
  category: string | null;
};

type AssignedTechnology = {
  technologyId: string;
  name: string;
  category: string | null;
};

type TeamPerson = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  title: string | null;
  profileSkills: string[];
  showOnAbout: boolean;
  technologies: AssignedTechnology[];
};

function roleChipClass(role: UserRole) {
  switch (normalizeRole(role)) {
    case "founder":
      return "bg-[#15130f] text-white hover:bg-sc-accent";
    case "lead":
      return "bg-sc-accent/15 text-sc-ink hover:bg-sc-accent/25";
    default:
      return "bg-sc-section-alt text-[#57524a] hover:bg-[#15130f]/10";
  }
}

export function TeamMemberManageDialog({
  person,
  returnTo,
  technologyCatalog,
  canEditRole,
  trigger = "manage",
}: {
  person: TeamPerson;
  returnTo: string;
  technologyCatalog: TechnologyOption[];
  canEditRole: boolean;
  trigger?: "manage" | "role";
}) {
  const displayName = person.name ?? person.email ?? "Team member";
  const assignedIds = new Set(person.technologies.map((item) => item.technologyId));
  const addOptions = technologyCatalog
    .filter((technology) => !assignedIds.has(technology.id))
    .map((technology) => ({
      value: technology.id,
      label: technology.name,
      description: technology.category ?? undefined,
    }));

  if (!canEditRole && trigger === "role") {
    return (
      <span
        className={cn(
          "inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase",
          roleChipClass(person.role),
        )}
      >
        {roleLabel(person.role)}
      </span>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger === "role" ? (
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors",
              roleChipClass(person.role),
            )}
          >
            {roleLabel(person.role)}
          </button>
        ) : (
          <button type="button" className={cn(appGhostButtonLg, "inline-flex items-center gap-2")}>
            <Pencil className="size-3.5" />
            Manage
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-h-[min(90vh,720px)] overflow-y-auto border-0 bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            {displayName}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
            Studio role, public title, then stack skills from the catalog.
          </DialogDescription>
        </DialogHeader>

        <form
          id={`team-member-profile-${person.id}`}
          action={updateTeamMember}
          className="hidden"
        >
          <input type="hidden" name="userId" value={person.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
        </form>

        <div className="mt-2 grid gap-4">
          {canEditRole ? (
            <Field label="Studio role" hint="Pick a role, then save at the bottom.">
              <div className="flex flex-wrap gap-2">
                {STUDIO_ROLES.map((role) => (
                  <label
                    key={role}
                    className={cn(
                      "cursor-pointer rounded-md border px-3 py-2 text-[10px] font-bold tracking-[0.1em] text-[#15130f] uppercase transition-colors has-[:checked]:border-sc-accent has-[:checked]:bg-sc-accent/15 has-[:checked]:text-[#15130f]",
                      normalizeRole(person.role) === normalizeRole(role)
                        ? "border-[#15130f]/20 bg-sc-section-alt/50"
                        : "border-[#15130f]/10 bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      form={`team-member-profile-${person.id}`}
                      value={role}
                      defaultChecked={normalizeRole(person.role) === normalizeRole(role)}
                      className="sr-only"
                    />
                    {roleLabel(role)}
                  </label>
                ))}
              </div>
            </Field>
          ) : (
            <>
              <input
                type="hidden"
                name="role"
                form={`team-member-profile-${person.id}`}
                value={normalizeRole(person.role)}
              />
              <p className="text-xs text-[#6f6a60]">
                Studio role: <strong>{roleLabel(person.role)}</strong> — another founder can change
                this; you can still update title, skills, and About here.
              </p>
            </>
          )}

          <Field label="Title on site" hint="Shown on About and team cards.">
            <StudioInput
              name="title"
              form={`team-member-profile-${person.id}`}
              defaultValue={person.title ?? ""}
              placeholder="Full Stack Developer"
              maxLength={120}
            />
          </Field>

          <section className="space-y-3 border-y border-[#15130f]/10 py-5">
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase">Skills</h3>
              <p className="mt-1 text-xs text-[#6f6a60]">
                Technologies from the catalog. These show on About when assigned.
              </p>
            </div>

            {person.technologies.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">No skills assigned yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {person.technologies.map((skill) => (
                  <li
                    key={skill.technologyId}
                    className={cn(appChip, "flex items-center gap-2 px-2.5 py-1 text-[11px]")}
                  >
                    <span>{skill.name}</span>
                    <form action={removeUserTechnology} className="inline">
                      <input type="hidden" name="userId" value={person.id} />
                      <input type="hidden" name="technologyId" value={skill.technologyId} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        type="submit"
                        aria-label={`Remove ${skill.name}`}
                        className="text-[#9a3b2e] hover:underline"
                      >
                        ×
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form action={assignUserTechnology} className="grid gap-3">
              <input type="hidden" name="userId" value={person.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Field label="Add from catalog">
                <MultiSelect
                  name="technologyIds"
                  options={addOptions}
                  placeholder="Select technologies…"
                  searchPlaceholder="Search stack…"
                  emptyText={
                    technologyCatalog.length === 0
                      ? "No technologies yet — add them under Studio → Technologies."
                      : "All catalog items are already assigned."
                  }
                  ariaLabel="Technologies to assign"
                />
              </Field>
              <button
                type="submit"
                className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
              >
                Assign skills
              </button>
            </form>
          </section>

          <button
            type="submit"
            form={`team-member-profile-${person.id}`}
            className={appPrimaryButtonStudioSubmit}
          >
            Save profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
