"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  Cpu,
  FolderKanban,
  Globe,
  LayoutDashboard,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "~/components/brand-logo";
import { sidebarCookieName } from "~/lib/dashboard";
import { cn } from "~/lib/utils";

export type DashboardIcon =
  | "overview"
  | "projects"
  | "notifications"
  | "reviews"
  | "messages"
  | "team"
  | "technologies"
  | "clients"
  | "profile";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardIcon;
  section?: string;
};

const ICONS: Record<DashboardIcon, LucideIcon> = {
  overview: LayoutDashboard,
  projects: FolderKanban,
  notifications: Bell,
  reviews: Star,
  messages: Mail,
  team: Users,
  technologies: Cpu,
  clients: Building2,
  profile: User,
};

type DashboardShellProps = {
  variant: "studio" | "portal";
  nav: DashboardNavItem[];
  user: {
    name?: string | null;
    email?: string | null;
    roleLabel: string;
  };
  actions: ReactNode;
  defaultCollapsed?: boolean;
  children: ReactNode;
};

export function DashboardShell({
  variant,
  nav,
  user,
  actions,
  defaultCollapsed = false,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const subtitle = variant === "studio" ? "Studio" : "Portal";
  const rootHref = `/${variant}`;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        document.cookie = `${sidebarCookieName(variant)}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // The in-memory state still works if cookies are unavailable.
      }
      return next;
    });
  };

  const sections = useMemo(() => {
    const grouped = new Map<string, DashboardNavItem[]>();
    for (const item of nav) {
      const key = item.section ?? "Workspace";
      const current = grouped.get(key);
      if (current) current.push(item);
      else grouped.set(key, [item]);
    }
    return Array.from(grouped.entries());
  }, [nav]);

  const isActive = (href: string) =>
    href === rootHref
      ? pathname === rootHref
      : pathname === href || pathname.startsWith(`${href}/`);

  const currentLabel =
    [...nav]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isActive(item.href))?.label ?? subtitle;

  const displayName = user.name?.trim() || user.email || "Account";
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#15130f]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#15130f]/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-[#15130f]/10 bg-white transition-[width,transform] duration-300 ease-out",
          collapsed ? "lg:w-[84px]" : "lg:w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-20 shrink-0 items-center overflow-hidden border-b border-[#15130f]/10 px-5">
          <span className={cn(collapsed && "lg:hidden")}>
            <BrandLogo href={rootHref} subtitle={subtitle} />
          </span>
          <span className={cn("hidden", collapsed && "lg:flex")}>
            <BrandLogo href={rootHref} subtitle={subtitle} compact />
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={`${subtitle} navigation`}>
          {sections.map(([section, items], index) => (
            <div
              key={section}
              className={cn(
                "space-y-1",
                index > 0 && "mt-2",
                index > 0 &&
                  collapsed &&
                  "lg:mt-3 lg:border-t lg:border-[#15130f]/10 lg:pt-3",
              )}
            >
              <p
                className={cn(
                  "px-3 pt-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-[#9a9488] uppercase",
                  collapsed && "lg:hidden",
                )}
              >
                {section}
              </p>

              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 border-l-2 px-3 py-2.5 text-[13px] font-semibold transition-colors",
                      collapsed && "lg:justify-center lg:px-0",
                      active
                        ? "border-[#f0a500] bg-[#15130f] text-white"
                        : "border-transparent text-[#57524a] hover:bg-[#f7f4ee] hover:text-[#15130f]",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className={cn("truncate", collapsed && "lg:hidden")}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-[#15130f]/10 px-3 pt-3 pb-12">
          <Link
            href="/"
            title="Back to site"
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-[11px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]",
              collapsed && "lg:justify-center lg:px-0",
            )}
          >
            <Globe className="size-4 shrink-0" />
            <span className={cn("truncate", collapsed && "lg:hidden")}>Back to site</span>
          </Link>
          <p
            className={cn(
              "mt-2 px-3 text-[10px] leading-relaxed text-[#9a9488]",
              collapsed && "lg:hidden",
            )}
          >
            {variant === "studio" ? "Internal studio" : "Client portal"}
          </p>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[264px]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-[#15130f]/10 bg-[#f7f4ee]/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={mobileOpen}
              className="inline-flex size-10 shrink-0 items-center justify-center border border-[#15130f]/15 bg-white text-[#15130f] transition-colors hover:border-[#f0a500] lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden size-10 shrink-0 items-center justify-center border border-[#15130f]/15 bg-white text-[#15130f] transition-colors hover:border-[#f0a500] lg:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>

            <span className="lg:hidden">
              <BrandLogo href={rootHref} subtitle={subtitle} />
            </span>

            <div className="hidden min-w-0 flex-col lg:flex">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase">
                {subtitle}
              </span>
              <span className="truncate text-sm font-bold tracking-[-0.01em] text-[#15130f]">
                {currentLabel}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border-l border-[#15130f]/10 pl-3 sm:flex">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#15130f] text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden flex-col leading-tight xl:flex">
                <span className="max-w-[160px] truncate text-[12px] font-semibold text-[#15130f]">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#6f6a60]">{user.roleLabel}</span>
              </span>
            </div>

            {actions}
          </div>
        </header>

        <main className="w-full px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
