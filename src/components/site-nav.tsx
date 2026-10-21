"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  description?: string;
};

type MenuColumn = {
  title: string;
  items: MenuItem[];
};

const MENU: { label: string; href: string; columns?: MenuColumn[] }[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Our Work",
    href: "/#our-work",
  },
  {
    label: "Our Team",
    href: "/#team",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#15130f]/10 bg-[#f7f4ee]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center bg-[#f0a500] font-mono leading-none font-bold tracking-[-0.08em] text-[#15130f]">
            <span className="inline-block -rotate-45 text-[18px]">{"</>"}</span>
          </span>
          <span className="text-xl leading-none font-black tracking-tight text-[#15130f] uppercase">
            Simply <span className="text-[#f0a500]">Code</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {MENU.map((entry) => (
            <Link
              key={entry.label}
              href={entry.href}
              className="text-[13px] font-bold tracking-[0.12em] text-[#15130f] uppercase transition-colors hover:text-[#b8770a]"
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/#contact"
            className="bg-[#15130f] px-6 py-3 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#b8770a]"
          >
            Request a quote
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center border border-[#15130f]/15 text-[#15130f] lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="max-h-[80vh] overflow-y-auto border-t border-[#15130f]/10 bg-[#f7f4ee] px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
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
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block bg-[#15130f] px-6 py-3.5 text-center text-[12px] font-bold tracking-[0.16em] text-white uppercase"
            >
              Request a quote
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
