import type { ReactNode } from "react";
import { BrandLogo } from "~/components/brand-logo";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function AuthScreen({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sc-canvas px-4 py-12 text-sc-ink">
      <div
        className={cn(
          appPanel,
          "w-full max-w-md p-6 shadow-[0_8px_32px_rgba(21,19,15,0.1)] ring-1 ring-[#15130f]/8",
        )}
      >
        <div className="mb-8">
          <BrandLogo href="/" className="mb-6" />
          <h1 className="text-[clamp(1.35rem,2.5vw,1.65rem)] font-black tracking-[-0.03em] text-[#15130f] uppercase">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-[#57524a]">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
      {footer ? <div className="mt-6 w-full max-w-md">{footer}</div> : null}
    </main>
  );
}

export function AuthFooterLinks({
  primary,
  secondary,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="space-y-2 text-center text-xs leading-relaxed text-[#6f6a60]">
      {primary}
      {secondary}
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-semibold text-[#15130f] underline-offset-4 transition-colors hover:text-sc-accent hover:underline"
    >
      {children}
    </a>
  );
}
