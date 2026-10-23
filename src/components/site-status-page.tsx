import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "~/components/brand-logo";
import {
  appGhostButtonLg,
  appPanel,
  appPrimaryButtonMarketing,
} from "~/lib/surface";

type SiteStatusPageProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  action?: { href: string; label: string };
};

/** Centered status card (maintenance, 404, etc.). */
export function SiteStatusPage({ eyebrow, title, description, action }: SiteStatusPageProps) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sc-canvas px-6 py-16 text-sc-ink">
      <div className={`w-full max-w-lg p-8 ${appPanel}`}>
        <div className="mb-8 flex justify-center">
          <BrandLogo className="min-w-max shrink-0" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-sc-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.03em] text-[#15130f] uppercase">
            {title}
          </h1>
          <div className="mt-4 text-sm leading-relaxed text-[#57524a]">{description}</div>
          {action ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={action.href} className={appPrimaryButtonMarketing}>
                {action.label}
              </Link>
              <Link href="/contact" className={appGhostButtonLg}>
                Contact
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
