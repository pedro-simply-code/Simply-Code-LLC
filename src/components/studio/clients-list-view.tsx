import Link from "next/link";
import { Building2, FolderKanban, Mail, Users } from "lucide-react";
import type { ClientOverviewRow } from "~/server/studio/queries";
import type { StudioViewMode } from "~/lib/studio-view";
import {
  appChip,
  appGhostButtonLg,
  appPanel,
  appPanelHover,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function portalStatus(client: ClientOverviewRow) {
  if (client.memberCount > 0) {
    return { label: "Portal active", className: "bg-[#e8f5e9] text-[#2e7d32]" };
  }
  if (client.pendingInviteCount > 0) {
    return {
      label: "Invite pending",
      className: "bg-[#fff8e6] text-[#b45309]",
    };
  }
  return {
    label: "No portal users",
    className: "bg-sc-section-alt text-[#6f6a60]",
  };
}

export function ClientsListView({
  clients,
  view,
}: {
  clients: ClientOverviewRow[];
  view: StudioViewMode;
}) {
  if (clients.length === 0) {
    return (
      <p className={cn(appPanel, "px-4 py-10 text-sm text-[#6f6a60]")}>
        No client organizations yet. Use <strong>New organization</strong> to
        add a company, then invite portal users from its detail page.
      </p>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => {
          const status = portalStatus(client);
          return (
            <article
              key={client.id}
              className={cn(appPanel, appPanelHover, "flex flex-col p-5")}
            >
              <div className="flex items-start gap-3">
                <div className="bg-sc-accent/15 text-sc-accent flex size-12 shrink-0 items-center justify-center rounded-md">
                  <Building2 className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-[#15130f]">
                    {client.name}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6f6a60]">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">
                      {client.contactEmail ?? "No billing contact"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={cn(appChip, "text-[9px]", status.className)}>
                  {status.label}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-sc-section-alt/50 rounded-md px-3 py-2">
                  <dt className="flex items-center gap-1 text-[#9a9488]">
                    <Users className="size-3" /> Portal users
                  </dt>
                  <dd className="mt-1 font-bold text-[#15130f]">
                    {client.memberCount}
                  </dd>
                </div>
                <div className="bg-sc-section-alt/50 rounded-md px-3 py-2">
                  <dt className="flex items-center gap-1 text-[#9a9488]">
                    <FolderKanban className="size-3" /> Projects
                  </dt>
                  <dd className="mt-1 font-bold text-[#15130f]">
                    {client.projectCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-[#15130f]/8 pt-4">
                <Link
                  href={`/studio/clients/${client.id}`}
                  className={cn(appGhostButtonLg, "w-full justify-center")}
                >
                  Open organization
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={cn(appPanel, "divide-y divide-[#15130f]/10")}>
      {clients.map((client) => {
        const status = portalStatus(client);
        return (
          <li
            key={client.id}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">{client.name}</p>
              <p className="text-[11px] text-[#6f6a60]">
                {client.contactEmail ?? "No billing contact"} ·{" "}
                {client.memberCount} portal users · {client.projectCount}{" "}
                projects
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(appChip, "text-[9px]", status.className)}>
                {status.label}
              </span>
              <Link
                href={`/studio/clients/${client.id}`}
                className={appGhostButtonLg}
              >
                Open
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
