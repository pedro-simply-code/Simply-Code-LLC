import Link from "next/link";
import { cn } from "~/lib/utils";

type BrandLogoProps = {
  href?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ href = "/", subtitle, compact = false, className }: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label={subtitle ? `Simply Code ${subtitle}` : "Simply Code"}
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      <span className="flex size-10 shrink-0 items-center justify-center bg-sc-accent-bright font-mono leading-none font-bold tracking-[-0.08em] text-[#15130f]">
        <span className="inline-block -rotate-45 text-[18px]">{"</>"}</span>
      </span>
      {compact ? null : (
        <span className="flex min-w-0 flex-col">
          <span className="text-xl leading-none font-black tracking-tight whitespace-nowrap text-[#15130f] uppercase">
            Simply <span className="text-sc-accent-bright">Code</span>
          </span>
          {subtitle ? (
            <span className="mt-1 text-[10px] leading-none font-semibold tracking-[0.18em] whitespace-nowrap text-[#6f6a60] uppercase">
              {subtitle}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
