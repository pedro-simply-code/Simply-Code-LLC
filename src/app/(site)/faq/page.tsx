import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { FAQ } from "~/content/faq";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about pricing, timelines, ownership, technologies, support and how to start a project with Simply Code.",
  path: "/faq",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <SiteNav />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                FAQ
              </p>
              <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                Questions,
                <br />
                Answered
              </h1>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#57524a]">
                The things clients ask before starting. If yours is not here,
                send it over — we answer every message.
              </p>
              <Link
                href="/contact"
                className="hover:bg-sc-accent mt-8 inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors"
              >
                Ask us directly <ArrowRight className="size-4" />
              </Link>
              <p className="mt-4 text-[13px] text-[#6f6a60]">
                Or email{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-sc-accent underline underline-offset-4"
                >
                  {SITE.email}
                </a>
              </p>
            </div>

            <div className="divide-y divide-[#15130f]/12 border-y border-[#15130f]/12">
              {FAQ.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                    <span className="text-[17px] leading-snug font-bold tracking-tight">
                      {item.question}
                    </span>
                    <Plus className="text-sc-accent mt-0.5 size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl pr-8 text-[15px] leading-relaxed text-[#57524a]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CtaSection
          title="Still have a question?"
          description="Send it with your project details and we will answer both in one reply."
        />
      </main>

      <SiteFooter />
    </>
  );
}
