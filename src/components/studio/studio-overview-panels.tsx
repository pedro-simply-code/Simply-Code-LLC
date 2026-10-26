import type { ReactNode } from "react";
import Link from "next/link";
import type {
  StudioOverviewRequestItem,
  StudioOverviewUpdateItem,
} from "~/server/studio/queries";
import {
  overviewPreviewGridClass,
  overviewPreviewListClass,
  overviewPreviewListItemClass,
  overviewPreviewListMobileOnlyClass,
  overviewPreviewSlotsShellClass,
  StudioOverviewColumn,
} from "~/components/studio/studio-overview-column";
import { StudioViewToggle } from "~/components/studio/studio-view-toggle";
import { EmptyState } from "~/components/studio/ui";
import {
  padStudioOverviewPreview,
  STUDIO_OVERVIEW_PREVIEW_SIZE,
} from "~/lib/studio-pagination";
import { normalizeRole } from "~/lib/roles";
import type { StudioViewMode } from "~/lib/studio-view";
import type { UserRole } from "~/server/db/schema";
import {
  appAccentButtonLg,
  appChip,
  appGhostButtonLg,
  appPanel,
  appPanelHover,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function formatOverviewWhen(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function StudioOverviewQuickLinks({
  maintenanceMode,
  unreadNotificationCount,
  showSiteSettings,
}: {
  maintenanceMode: boolean;
  unreadNotificationCount: number;
  showSiteSettings: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("inline-flex items-center", appGhostButtonLg)}
        >
          View public site
        </a>
        <Link
          href="/work"
          className={cn("inline-flex items-center", appGhostButtonLg)}
        >
          Portfolio
        </Link>
        <Link
          href="/studio/notifications"
          className={cn("inline-flex items-center", appGhostButtonLg)}
        >
          Notifications
          {unreadNotificationCount > 0 ? (
            <span className="bg-sc-accent ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          ) : null}
        </Link>
        {showSiteSettings ? (
          <Link
            href="/studio/settings"
            className={cn("inline-flex items-center gap-2", appGhostButtonLg)}
          >
            Site settings
            {maintenanceMode ? (
              <span
                className={cn(
                  appChip,
                  "bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-950",
                )}
              >
                Maintenance on
              </span>
            ) : null}
          </Link>
        ) : null}
      </div>
      <StudioViewToggle />
    </div>
  );
}

export type StudioOverviewStat = {
  label: string;
  value: number;
  href: string;
};

export function StudioOverviewStats({
  stats,
  view,
}: {
  stats: StudioOverviewStat[];
  view: StudioViewMode;
}) {
  if (stats.length === 0) return null;

  const gridLayout = view === "grid";

  return (
    <div
      className={cn(
        "grid gap-3",
        gridLayout ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1",
      )}
    >
      {stats.map((stat) =>
        gridLayout ? (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              appPanel,
              appPanelHover,
              "flex items-center justify-between gap-4 p-4 sm:block sm:p-5",
            )}
          >
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#57524a] uppercase sm:hidden">
              {stat.label}
            </p>
            <p className="text-sc-accent text-[28px] leading-none font-black tracking-[-0.03em] sm:text-[32px]">
              {stat.value}
            </p>
            <p className="mt-2 hidden text-[10px] font-bold tracking-[0.16em] text-[#57524a] uppercase sm:block">
              {stat.label}
            </p>
          </Link>
        ) : (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              appPanel,
              appPanelHover,
              "flex items-center justify-between gap-4 p-4",
            )}
          >
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#57524a] uppercase">
              {stat.label}
            </p>
            <p className="text-sc-accent text-[28px] leading-none font-black tracking-[-0.03em]">
              {stat.value}
            </p>
          </Link>
        ),
      )}
    </div>
  );
}

type StudioOverviewFeedItem = {
  id: string;
  title: string;
  body: string;
  /** Request priority or update visibility label. */
  badge: string;
  personLine: { label: string; value: string } | null;
  projectTitle: string;
  href: string;
  createdAt: Date;
};

const overviewFeedTitleClass =
  "line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#15130f]";

const overviewFeedBodyClass =
  "line-clamp-2 min-h-[2.5rem] text-xs leading-snug text-[#57524a]";

function overviewGridCellClassName() {
  return cn(appPanel, appPanelHover, "flex h-full min-h-0 flex-col p-3");
}

const overviewFeedGhostItem: StudioOverviewFeedItem = {
  id: "__overview-feed-ghost__",
  title: "Placeholder title for two-line layout preview",
  body: "Placeholder description text reserved for up to two lines in the card.",
  badge: "Normal",
  personLine: { label: "Client", value: "Pedro - Dark Art" },
  projectTitle: "Dark Art",
  href: "#",
  createdAt: new Date(0),
};

function OverviewFeedMetaLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className="line-clamp-1 text-[10px] leading-snug text-[#57524a]">
      <span className="font-bold text-[#15130f]">{label}:</span> {value}
    </p>
  );
}

function formatOverviewClientMeta(
  personName: string | null | undefined,
  clientName: string | null | undefined,
): string | null {
  const person = personName?.trim();
  const client = clientName?.trim();
  if (person && client) return `${person} - ${client}`;
  if (person) return person;
  if (client) return client;
  return null;
}

function OverviewFeedCardContent({ item }: { item: StudioOverviewFeedItem }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className={cn(overviewFeedTitleClass, "min-w-0 flex-1")}>
          {item.title}
        </p>
        <span
          className={cn(appChip, "shrink-0 px-1.5 py-0.5 text-[9px] uppercase")}
        >
          {item.badge}
        </span>
      </div>
      <p className={cn(overviewFeedBodyClass, "mt-1")}>
        {item.body.trim() ? item.body : "\u00a0"}
      </p>
      <div className="mt-1 space-y-0.5">
        {item.personLine ? (
          <OverviewFeedMetaLine
            label={item.personLine.label}
            value={item.personLine.value}
          />
        ) : null}
        <OverviewFeedMetaLine label="Project" value={item.projectTitle} />
      </div>
      <div className="mt-auto pt-1.5">
        <time
          className="block text-[10px] font-bold tracking-[0.08em] text-[#9a9488] uppercase"
          dateTime={item.createdAt.toISOString()}
        >
          {formatOverviewWhen(item.createdAt)}
        </time>
      </div>
    </div>
  );
}

function StudioOverviewFeedColumn({
  title,
  description,
  emptyMessage,
  footer,
  items,
  view,
  ghostItem = overviewFeedGhostItem,
  className,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  footer: ReactNode;
  items: StudioOverviewFeedItem[];
  view: StudioViewMode;
  ghostItem?: StudioOverviewFeedItem;
  className?: string;
}) {
  const preview = items.slice(0, STUDIO_OVERVIEW_PREVIEW_SIZE);
  const slots = padStudioOverviewPreview(preview);
  const hasItems = preview.length > 0;

  const renderListSlot = (
    item: StudioOverviewFeedItem | null,
    index: number,
  ) => {
    const key = item?.id ?? `feed-slot-${index}`;
    if (!item) {
      return (
        <li
          key={key}
          className={cn(
            overviewPreviewListItemClass,
            "pointer-events-none invisible select-none",
          )}
          aria-hidden
        >
          <div className="block">
            <OverviewFeedCardContent item={ghostItem} />
          </div>
        </li>
      );
    }
    return (
      <li key={key} className={overviewPreviewListItemClass}>
        <Link
          href={item.href}
          className="hover:text-sc-accent block transition-colors"
        >
          <OverviewFeedCardContent item={item} />
        </Link>
      </li>
    );
  };

  const renderGridSlot = (
    item: StudioOverviewFeedItem | null,
    index: number,
  ) => {
    const key = item?.id ?? `feed-grid-slot-${index}`;
    if (!item) {
      return (
        <div
          key={key}
          className={cn(
            overviewGridCellClassName(),
            "pointer-events-none invisible select-none",
          )}
          aria-hidden
        >
          <OverviewFeedCardContent item={ghostItem} />
        </div>
      );
    }
    return (
      <Link
        key={key}
        href={item.href}
        className={cn(
          overviewGridCellClassName(),
          "hover:text-sc-accent transition-colors",
        )}
      >
        <OverviewFeedCardContent item={item} />
      </Link>
    );
  };

  return (
    <StudioOverviewColumn
      className={className}
      title={title}
      description={description}
      footer={footer}
    >
      <div className={overviewPreviewSlotsShellClass}>
        {!hasItems ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2">
            <EmptyState>{emptyMessage}</EmptyState>
          </div>
        ) : null}
        {view === "grid" ? (
          <>
            <ul className={overviewPreviewListMobileOnlyClass}>
              {slots.map((item, index) => renderListSlot(item, index))}
            </ul>
            <div className={overviewPreviewGridClass}>
              {slots.map((item, index) => renderGridSlot(item, index))}
            </div>
          </>
        ) : (
          <ul className={overviewPreviewListClass}>
            {slots.map((item, index) => renderListSlot(item, index))}
          </ul>
        )}
      </div>
    </StudioOverviewColumn>
  );
}

function formatOverviewRequestType(type: string) {
  if (type === "change") return "Change";
  if (type === "request") return "Request";
  return type;
}

function formatOverviewRequestPriority(priority: string) {
  if (!priority) return "Normal";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatOverviewUpdateVisibility(visibility: string) {
  return visibility === "internal" ? "Internal" : "Client";
}

function overviewUpdatePersonLabel(
  projectRole: string | null | undefined,
  authorRole: string | null | undefined,
): "Lead" | "Developer" {
  if (projectRole === "lead") return "Lead";
  if (projectRole === "developer") return "Developer";
  const role = normalizeRole(authorRole as UserRole | null);
  if (role === "lead" || role === "founder") return "Lead";
  return "Developer";
}

function toRequestFeedItems(
  items: StudioOverviewRequestItem[],
): StudioOverviewFeedItem[] {
  return items.map((item) => {
    const clientValue = formatOverviewClientMeta(
      item.authorName,
      item.clientName,
    );
    return {
      id: item.id,
      title: item.title,
      body: item.description,
      badge: `${formatOverviewRequestType(item.type)} · ${formatOverviewRequestPriority(item.priority)}`,
      personLine: clientValue ? { label: "Client", value: clientValue } : null,
      projectTitle: item.projectTitle,
      href: `/studio/projects/${item.projectId}?tab=requests`,
      createdAt: item.createdAt,
    };
  });
}

function toUpdateFeedItems(
  items: StudioOverviewUpdateItem[],
): StudioOverviewFeedItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    badge: formatOverviewUpdateVisibility(item.visibility),
    personLine: {
      label: overviewUpdatePersonLabel(item.projectRole, item.authorRole),
      value: item.authorName?.trim() || "Studio",
    },
    projectTitle: item.projectTitle,
    href: `/studio/projects/${item.projectId}?tab=updates`,
    createdAt: item.createdAt,
  }));
}

export function StudioOverviewRequests({
  items,
  openCount,
  view,
  className,
}: {
  items: StudioOverviewRequestItem[];
  openCount: number;
  view: StudioViewMode;
  className?: string;
}) {
  return (
    <StudioOverviewFeedColumn
      className={className}
      title="Client requests"
      description={
        openCount > 0
          ? `${openCount} open request${openCount === 1 ? "" : "s"} from client portals.`
          : "New scope or support requests submitted by clients."
      }
      emptyMessage="No open client requests."
      footer={
        <Link href="/studio/projects" className={appAccentButtonLg}>
          All projects
        </Link>
      }
      items={toRequestFeedItems(items)}
      view={view}
      ghostItem={{
        id: "__overview-request-ghost__",
        title: "Client request title for two-line preview",
        body: "What the client needs or wants changed in the project.",
        badge: "Change · Normal",
        personLine: { label: "Client", value: "Pedro - Dark Art" },
        projectTitle: "Dark Art",
        href: "#",
        createdAt: new Date(0),
      }}
    />
  );
}

export function StudioOverviewUpdates({
  items,
  view,
  className,
}: {
  items: StudioOverviewUpdateItem[];
  view: StudioViewMode;
  className?: string;
}) {
  return (
    <StudioOverviewFeedColumn
      className={className}
      title="Project updates"
      description="Latest progress posts across your projects (client and internal)."
      emptyMessage="No project updates yet."
      footer={
        <Link href="/studio/projects" className={appAccentButtonLg}>
          All projects
        </Link>
      }
      items={toUpdateFeedItems(items)}
      view={view}
      ghostItem={{
        id: "__overview-update-ghost__",
        title: "Project update title for two-line preview",
        body: "Progress details shown here with up to two lines of text.",
        badge: "Client",
        personLine: { label: "Lead", value: "Ryan" },
        projectTitle: "Dark Art",
        href: "#",
        createdAt: new Date(0),
      }}
    />
  );
}
