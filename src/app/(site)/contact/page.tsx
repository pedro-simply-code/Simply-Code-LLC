import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "~/components/contact-form";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";
import { appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell us about your project. We reply within one business day with next steps, a scope and a fixed quote.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <SiteNav />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                Contact
              </p>
              <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                Let&apos;s Talk
                <br />
                About Your Project
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]">
                Tell us what you are building, what is getting in the way and
                when you need it. You&apos;ll get a straight answer from the
                developer who would do the work — not a sales pitch.
              </p>

              <ul className="mt-10 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="text-sc-accent-bright flex size-10 shrink-0 items-center justify-center bg-[#15130f]">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="hover:text-sc-accent mt-1 block text-[15px] font-semibold text-[#15130f] underline underline-offset-4"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-sc-accent-bright flex size-10 shrink-0 items-center justify-center bg-[#15130f]">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase">
                      Response time
                    </p>
                    <p className="mt-1 text-[15px] text-[#57524a]">
                      {SITE.responseTime}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-sc-accent-bright flex size-10 shrink-0 items-center justify-center bg-[#15130f]">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase">
                      Location
                    </p>
                    <p className="mt-1 text-[15px] text-[#57524a]">
                      {SITE.location}
                    </p>
                  </div>
                </li>
              </ul>

              <div className={cn(appPanel, "mt-10 p-6")}>
                <p className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase">
                  What happens next
                </p>
                <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#57524a]">
                  <li>
                    1. We read your brief and reply with questions or a call
                    invite.
                  </li>
                  <li>
                    2. A short discovery call to understand scope, timeline and
                    budget.
                  </li>
                  <li>
                    3. A written proposal with stages, a timeline and a fixed
                    quote.
                  </li>
                </ol>
              </div>

              <p className="mt-6 text-[13px] text-[#6f6a60]">
                Questions about how we work?{" "}
                <Link
                  href="/faq"
                  className="hover:text-sc-accent underline underline-offset-4"
                >
                  Read the FAQ
                </Link>
                .
              </p>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
