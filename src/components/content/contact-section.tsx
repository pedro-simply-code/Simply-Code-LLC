"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "~/components/contact-form";
import type { ContactSectionData } from "~/lib/homepage-sections";
import { appContactBand, appSectionContainer, siteReveal } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function ContactSection({
  data,
  className,
  introOverride,
}: {
  data: ContactSectionData;
  className?: string;
  introOverride?: ReactNode;
}) {
  const headlineLines = data.headline.split("\n");

  return (
    <section
      id="contact"
      className={cn(appContactBand, className)}
    >
      <div className={appSectionContainer}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
          <div className={siteReveal}>
            {introOverride ?? (
              <>
                {data.eyebrow ? (
                  <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                    {data.eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                  {headlineLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </h2>
                {data.description ? (
                  <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#57524a]">
                    {data.description}
                  </p>
                ) : null}
                {data.faqLabel.trim() ? (
                  <Link
                    href={data.faqHref.trim() || "/faq"}
                    target={data.faqNewTab ? "_blank" : undefined}
                    rel={data.faqNewTab ? "noreferrer noopener" : undefined}
                    className="hover:text-sc-accent mt-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors"
                  >
                    {data.faqLabel}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                ) : null}
              </>
            )}
          </div>
          {data.showForm ? (
            <div className={siteReveal}>
              <ContactForm />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
