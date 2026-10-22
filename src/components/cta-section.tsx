import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "~/content/site";

type CtaSectionProps = {
  title?: string;
  description?: string;
};

export function CtaSection({
  title = "Let's talk about your project.",
  description = "Tell us about your goals and we'll get back to you with a plan to bring your ideas to life. Direct communication with the developers building it — no middlemen.",
}: CtaSectionProps) {
  return (
    <section className="border-t border-[#15130f]/10 bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <h2 className="max-w-3xl text-[clamp(2rem,4.8vw,3.6rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              {title}
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]">{description}</p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#b8770a]"
            >
              Start Your Project <ArrowRight className="size-4" />
            </Link>
            <a
              href={`mailto:${SITE.email}`}
              className="text-[14px] font-semibold text-[#15130f] underline underline-offset-8 transition-colors hover:text-[#b8770a]"
            >
              {SITE.email}
            </a>
            <p className="text-[12px] tracking-[0.12em] text-[#6f6a60] uppercase">
              Reply {SITE.responseTime.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
