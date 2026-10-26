import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { SERVICES } from "~/content/services";
import { SITE } from "~/content/site";

const COMPANY_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#15130f] pt-16 text-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="bg-sc-accent-bright flex size-11 items-center justify-center font-mono leading-none font-bold tracking-[-0.08em] text-[#15130f]">
                <span className="inline-block -rotate-45 text-[18px]">
                  {"</>"}
                </span>
              </span>
              <span className="text-2xl leading-none font-black tracking-tight uppercase">
                Simply <span className="text-sc-accent-bright">Code</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/55">
              A full-service web development agency delivering custom solutions
              with clean code, exceptional performance and a dedicated team.
            </p>

            <div className="mt-6 space-y-3 text-[14px] text-white/55">
              <div className="flex items-start gap-2.5">
                <Mail
                  className="text-sc-accent-bright mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-sc-accent-bright transition-colors"
                >
                  {SITE.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="text-sc-accent-bright mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <p>{SITE.location}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em] uppercase">
                Services
              </p>
              <ul className="mt-4 space-y-2.5">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services#${service.slug}`}
                      className="hover:text-sc-accent-bright text-[14px] text-white/60 transition-colors"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em] uppercase">
                Company
              </p>
              <ul className="mt-4 space-y-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-sc-accent-bright text-[14px] text-white/60 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em] uppercase">
                Start a Project
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/60">
                Have something in mind? Tell us about it and we&apos;ll reply{" "}
                {SITE.responseTime.toLowerCase()}.
              </p>
              <Link
                href="/contact"
                className="hover:text-sc-accent-bright mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-white transition-colors"
              >
                Request a quote <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-8">
          <p className="text-xs text-white/35">
            © 2026 {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-xs text-white/35">
            <Link href="/portal" className="transition-colors hover:text-white">
              Client portal
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Team access
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <span>High-performance web development agency.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
