import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms covering the use of the Simply Code website and the start of a project.",
  path: "/terms",
});

const UPDATED = "October 2026";

export default function TermsPage() {
  return (
    <>
      <SiteNav />

      <main id="main" className="bg-[#f7f4ee] text-[#15130f]">
        <section className="bg-[#f7f4ee] py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
              Legal
            </p>
            <h1 className="mt-5 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] font-black tracking-[-0.04em] uppercase">
              Terms of Service
            </h1>
            <p className="mt-4 text-[13px] tracking-[0.08em] text-[#6f6a60] uppercase">
              Last updated: {UPDATED}
            </p>

            <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#57524a]">
              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  1. About these terms
                </h2>
                <p className="mt-3">
                  These terms apply to the use of this website, operated by {SITE.name}. By browsing
                  the site or sending an enquiry you accept them. Project work is governed by a
                  separate written proposal or agreement, which takes precedence over these terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  2. Website content
                </h2>
                <p className="mt-3">
                  Case studies, service descriptions and other content are provided for information.
                  They describe past work and capabilities but are not a guarantee of a particular
                  result. Any timelines, scope or pricing for your project are only valid when
                  confirmed in writing in a proposal.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  3. Intellectual property
                </h2>
                <p className="mt-3">
                  The design, text, code and images on this website belong to {SITE.name} or are used
                  with permission. You may not copy or republish them without written consent. Work
                  delivered to clients is licensed or assigned according to the project agreement.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  4. Acceptable use
                </h2>
                <p className="mt-3">
                  Do not attempt to disrupt the site, gain unauthorised access to it, scrape it at
                  scale or use the contact form to send spam, unlawful content or malicious code.
                  Access may be restricted if these rules are broken.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  5. Third-party links
                </h2>
                <p className="mt-3">
                  The site links to external services and client websites. We are not responsible for
                  their content, availability or privacy practices.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  6. Availability and liability
                </h2>
                <p className="mt-3">
                  The website is provided &quot;as is&quot;. We aim to keep it available and accurate
                  but do not guarantee uninterrupted access or that every detail is free of errors.
                  To the extent permitted by law, {SITE.name} is not liable for indirect or
                  consequential loss arising from use of this website.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  7. Changes and contact
                </h2>
                <p className="mt-3">
                  We may update these terms from time to time; the current version is always on this
                  page. Questions can be sent to{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-semibold text-[#15130f] underline underline-offset-4 hover:text-[#b8770a]"
                  >
                    {SITE.email}
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
