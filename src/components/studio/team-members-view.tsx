import Image from "next/image";
import type { UserRole } from "~/server/db/schema";
import { TeamAboutToggle } from "~/components/studio/team-about-toggle";
import { TeamMemberManageDialog } from "~/components/studio/team-member-manage-dialog";
import type { StudioViewMode } from "~/lib/studio-view";
import { roleLabel } from "~/lib/roles";
import { appChip, appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

type AssignedTechnology = {
  technologyId: string;
  name: string;
  category: string | null;
};

type TechnologyOption = {
  id: string;
  name: string;
  category: string | null;
};

type Person = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  title: string | null;
  profileSkills: string[];
  showOnAbout: boolean;
  technologies: AssignedTechnology[];
};

function initials(name: string | null, email: string | null): string {
  const base = name?.trim() || email?.split("@")[0] || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

function TeamAvatar({ person }: { person: Person }) {
  return (
    <div className="from-sc-accent-bright to-sc-accent relative size-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br shadow-[0_2px_12px_rgba(21,19,15,0.1)] ring-2 ring-white">
      {person.image ? (
        <Image
          src={person.image}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center text-white">
          <span className="text-lg font-black tracking-tight">
            {initials(person.name, person.email)}
          </span>
        </div>
      )}
    </div>
  );
}

function SkillChips({ technologies }: { technologies: AssignedTechnology[] }) {
  const labels = technologies.map((item) => item.name);

  if (!labels.length) {
    return (
      <p className="text-[11px] text-[#9a9488]">
        No stack assigned — open Manage to pick from the catalog.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {labels.slice(0, 8).map((skill) => (
        <li key={skill} className={cn(appChip, "text-[9px]")}>
          {skill}
        </li>
      ))}
      {labels.length > 8 ? (
        <li className={cn(appChip, "text-[9px]")}>+{labels.length - 8}</li>
      ) : null}
    </ul>
  );
}

export function TeamMembersView({
  team,
  currentUserId,
  view,
  returnTo,
  technologyCatalog,
  canManageAbout,
}: {
  team: Person[];
  currentUserId: string;
  view: StudioViewMode;
  returnTo: string;
  technologyCatalog: TechnologyOption[];
  canManageAbout: boolean;
}) {
  if (view === "grid") {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((person) => {
          const isSelf = person.id === currentUserId;
          const skillLabel = "Skills";

          return (
            <article
              key={person.id}
              className={cn(appPanel, appPanelHover, "flex flex-col p-5")}
            >
              <div className="flex flex-col items-center text-center">
                <TeamAvatar person={person} />
                <h3 className="mt-4 text-sm font-bold text-[#15130f]">
                  {person.name ?? person.email}
                  {isSelf ? (
                    <span className="text-sc-accent ml-2 text-[10px] font-bold tracking-[0.12em] uppercase">
                      You
                    </span>
                  ) : null}
                </h3>
                <p className="mt-1 text-[11px] text-[#6f6a60]">
                  {person.email}
                </p>
                <p className="text-sc-accent mt-2 text-[12px] font-semibold tracking-[0.08em] uppercase">
                  {person.title?.trim() || roleLabel(person.role)}
                </p>
                <div className="mt-3">
                  <TeamMemberManageDialog
                    person={person}
                    returnTo={returnTo}
                    technologyCatalog={technologyCatalog}
                    canEditRole={!isSelf}
                    trigger="role"
                  />
                </div>
                {person.showOnAbout ? (
                  <p className="mt-2 text-[9px] font-bold tracking-[0.14em] text-[#2e7d32] uppercase">
                    On About page
                  </p>
                ) : null}
                {canManageAbout ? (
                  <TeamAboutToggle
                    userId={person.id}
                    showOnAbout={person.showOnAbout}
                    returnTo={returnTo}
                  />
                ) : null}
              </div>

              <div className="mt-5 flex-1 border-t border-[#15130f]/8 pt-4">
                <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#9a9488] uppercase">
                  {skillLabel}
                </p>
                <SkillChips technologies={person.technologies} />
              </div>

              <div className="mt-4 flex justify-center border-t border-[#15130f]/8 pt-4">
                <TeamMemberManageDialog
                  person={person}
                  returnTo={returnTo}
                  technologyCatalog={technologyCatalog}
                  canEditRole={!isSelf}
                  trigger="manage"
                />
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={cn(appPanel, "divide-y divide-[#15130f]/10")}>
      {team.map((person) => {
        const isSelf = person.id === currentUserId;

        return (
          <li
            key={person.id}
            className="flex flex-wrap items-start gap-4 px-4 py-5"
          >
            <TeamAvatar person={person} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {person.name ?? person.email}
                    {isSelf ? (
                      <span className="text-sc-accent ml-2 text-[10px] font-bold tracking-[0.12em] uppercase">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-[#6f6a60]">{person.email}</p>
                  <p className="mt-1 text-[11px] text-[#57524a]">
                    {person.title?.trim() || roleLabel(person.role)}
                  </p>
                </div>
                <TeamMemberManageDialog
                  person={person}
                  returnTo={returnTo}
                  technologyCatalog={technologyCatalog}
                  canEditRole={!isSelf}
                  trigger="role"
                />
              </div>
              <div className="mt-3">
                <SkillChips technologies={person.technologies} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <TeamMemberManageDialog
                  person={person}
                  returnTo={returnTo}
                  technologyCatalog={technologyCatalog}
                  canEditRole={!isSelf}
                  trigger="manage"
                />
                {canManageAbout ? (
                  <TeamAboutToggle
                    userId={person.id}
                    showOnAbout={person.showOnAbout}
                    returnTo={returnTo}
                  />
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
