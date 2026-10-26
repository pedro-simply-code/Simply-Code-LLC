"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "~/components/brand-logo";
import { appIconButton } from "~/lib/surface";
import { cn } from "~/lib/utils";

const MENU = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-sc-canvas/95 sticky top-0 z-50 border-b border-[#15130f]/10 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-[#15130f] focus:px-4 focus:py-2 focus:text-[11px] focus:font-bold focus:tracking-[0.16em] focus:text-white focus:uppercase"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-6">
        <BrandLogo href="/" />

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {MENU.map((entry) => (
            <Link
              key={entry.label}
              href={entry.href}
              aria-current={isActive(entry.href) ? "page" : undefined}
              className={cn(
                "hover:text-sc-accent text-[13px] font-bold tracking-[0.12em] uppercase transition-colors",
                isActive(entry.href) ? "text-sc-accent" : "text-[#15130f]",
              )}
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/contact"
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-6 py-3 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-colors"
          >
            Request a quote
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(appIconButton, "size-10 lg:hidden")}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="bg-sc-section-alt max-h-[80vh] overflow-y-auto border-t border-[#15130f]/10 px-6 py-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {MENU.map((entry) => (
              <Link
                key={entry.label}
                href={entry.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#15130f]/10 pb-4 text-sm font-bold tracking-[0.14em] text-[#15130f] uppercase"
              >
                {entry.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="hover:bg-sc-accent mt-2 block rounded-md bg-[#15130f] px-6 py-3.5 text-center text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-colors"
            >
              Request a quote
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
