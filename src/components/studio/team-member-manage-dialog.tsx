"use client";

import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MultiSelect } from "~/components/studio/multi-select";
import { PerfectScrollArea } from "~/components/perfect-scroll-area";
import { Field, StudioInput } from "~/components/studio/ui";
import type { UserRole } from "~/server/db/schema";
import { updateTeamMember } from "~/server/studio/actions";
import { roleLabel, normalizeRole } from "~/lib/roles";
import {
  appChip,
  appGhostButtonLg,
  appPrimaryButtonStudioSubmit,
} from "~/lib/surface";
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

function TeamMemberManageForm({
  person,
  returnTo,
  technologyCatalog,
  canEditRole,
}: {
  person: TeamPerson;
  returnTo: string;
  technologyCatalog: TechnologyOption[];
  canEditRole: boolean;
}) {
  const displayName = person.name ?? person.email ?? "Team member";
  const [draftSkills, setDraftSkills] = useState<AssignedTechnology[]>(() =>
    person.technologies.map((skill) => ({ ...skill })),
  );
  const [pickerKey, setPickerKey] = useState(0);

  const draftIds = useMemo(
    () => new Set(draftSkills.map((skill) => skill.technologyId)),
    [draftSkills],
  );

  const addOptions = useMemo(
    () =>
      technologyCatalog
        .filter((technology) => !draftIds.has(technology.id))
        .map((technology) => ({
          value: technology.id,
          label: technology.name,
          description: technology.category ?? undefined,
        })),
    [draftIds, technologyCatalog],
  );

  const mergePickerSelection = (ids: string[]) => {
    if (ids.length === 0) return;
    setDraftSkills((current) => {
      const known = new Set(current.map((skill) => skill.technologyId));
      const next = [...current];
      for (const id of ids) {
        if (known.has(id)) continue;
        const technology = technologyCatalog.find((row) => row.id === id);
        if (!technology) continue;
        next.push({
          technologyId: technology.id,
          name: technology.name,
          category: technology.category,
        });
      }
      return next;
    });
    setPickerKey((value) => value + 1);
  };

  return (
    <>
      <DialogHeader className="shrink-0 pr-10 text-left">
        <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
          {displayName}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
          Studio role, public title, then stack skills from the catalog. Changes
          apply when you save.
        </DialogDescription>
      </DialogHeader>

      <PerfectScrollArea className="min-h-0 flex-1">
        <form action={updateTeamMember} className="mt-2 grid gap-4 pr-1">
          <input type="hidden" name="userId" value={person.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          {draftSkills.map((skill) => (
            <input
              key={skill.technologyId}
              type="hidden"
              name="technologyIds"
              value={skill.technologyId}
            />
          ))}

          {canEditRole ? (
            <Field
              label="Studio role"
              hint="Pick a role, then save at the bottom."
            >
              <div className="flex flex-wrap gap-2">
                {STUDIO_ROLES.map((role) => (
                  <label
                    key={role}
                    className={cn(
                      "has-[:checked]:border-sc-accent has-[:checked]:bg-sc-accent/15 cursor-pointer rounded-md border px-3 py-2 text-[10px] font-bold tracking-[0.1em] text-[#15130f] uppercase transition-colors has-[:checked]:text-[#15130f]",
                      normalizeRole(person.role) === normalizeRole(role)
                        ? "bg-sc-section-alt/50 border-[#15130f]/20"
                        : "border-[#15130f]/10 bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      defaultChecked={
                        normalizeRole(person.role) === normalizeRole(role)
                      }
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
                value={normalizeRole(person.role)}
              />
              <p className="text-xs text-[#6f6a60]">
                Studio role: <strong>{roleLabel(person.role)}</strong> — another
                founder can change this; you can still update title and skills
                here.
              </p>
            </>
          )}

          <Field label="Title on site" hint="Shown on About and team cards.">
            <StudioInput
              name="title"
              defaultValue={person.title ?? ""}
              placeholder="Full Stack Developer"
              maxLength={120}
            />
          </Field>

          <section className="space-y-3 border-y border-[#15130f]/10 py-5">
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase">
                Skills
              </h3>
              <p className="mt-1 text-xs text-[#6f6a60]">
                Add or remove skills here; nothing is written to the database
                until you save.
              </p>
            </div>

            {draftSkills.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">No skills assigned yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {draftSkills.map((skill) => (
                  <li
                    key={skill.technologyId}
                    className={cn(
                      appChip,
                      "flex items-center gap-2 px-2.5 py-1 text-[11px]",
                    )}
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftSkills((current) =>
                          current.filter(
                            (row) => row.technologyId !== skill.technologyId,
                          ),
                        )
                      }
                      aria-label={`Remove ${skill.name}`}
                      className="text-[#9a3b2e] hover:underline"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Field label="Add from catalog">
              <MultiSelect
                key={pickerKey}
                name="technologyIdsPicker"
                options={addOptions}
                placeholder="Select technologies…"
                searchPlaceholder="Search stack…"
                emptyText={
                  technologyCatalog.length === 0
                    ? "No technologies yet — add them under Studio → Technologies."
                    : "All catalog items are already assigned."
                }
                ariaLabel="Technologies to assign on save"
                submitHiddenInputs={false}
                showSelectedBadges={false}
                onChange={mergePickerSelection}
              />
            </Field>
          </section>

          <button type="submit" className={appPrimaryButtonStudioSubmit}>
            Save profile
          </button>
        </form>
      </PerfectScrollArea>
    </>
  );
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
  const [open, setOpen] = useState(false);

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
    <Dialog open={open} onOpenChange={setOpen}>
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
          <button
            type="button"
            className={cn(appGhostButtonLg, "inline-flex items-center gap-2")}
          >
            <Pencil className="size-3.5" />
            Manage
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg">
        {open ? (
          <TeamMemberManageForm
            key={person.id}
            person={person}
            returnTo={returnTo}
            technologyCatalog={technologyCatalog}
            canEditRole={canEditRole}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
