import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Simply Code collects, uses and protects the information you share with us.",
  path: "/privacy",
});

const UPDATED = "October 2026";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-[13px] tracking-[0.08em] text-[#6f6a60] uppercase">
              Last updated: {UPDATED}
            </p>

            <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#57524a]">
              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  1. Who we are
                </h2>
                <p className="mt-3">
                  {SITE.name} is a web development agency working remotely from Guatemala and the
                  United States. For any privacy question you can contact us at{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-semibold text-[#15130f] underline underline-offset-4 hover:text-[#b8770a]"
                  >
                    {SITE.email}
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  2. Information we collect
                </h2>
                <p className="mt-3">
                  We only collect what you choose to send us. When you use the contact form we
                  receive your name, email address, company (optional), the service you selected and
                  your message. Our servers may also record standard technical information such as
                  the time of the request for security and spam prevention.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  3. How we use it
                </h2>
                <p className="mt-3">
                  Your information is used to reply to your enquiry, prepare a proposal and, if we
                  work together, to deliver the project. We do not sell your data, rent it or use it
                  for advertising.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  4. Cookies and analytics
                </h2>
                <p className="mt-3">
                  This website does not set advertising or analytics cookies. If you sign in to the
                  client area we use a strictly necessary authentication cookie to keep you signed
                  in. No consent banner is required because no tracking cookies are used.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  5. Service providers
                </h2>
                <p className="mt-3">
                  We use third-party providers for hosting and for delivering email. They process
                  data on our behalf and only for those purposes. Contact form messages are
                  transmitted to our inbox through our email provider.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  6. Retention
                </h2>
                <p className="mt-3">
                  Enquiries are kept for as long as needed to respond and to maintain a record of
                  the conversation. You can ask us to delete your enquiry at any time.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  7. Your rights
                </h2>
                <p className="mt-3">
                  You can ask us what personal data we hold about you, request a correction or ask
                  us to delete it. Email{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-semibold text-[#15130f] underline underline-offset-4 hover:text-[#b8770a]"
                  >
                    {SITE.email}
                  </a>{" "}
                  and we will respond within a reasonable period.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                  8. Changes
                </h2>
                <p className="mt-3">
                  If this policy changes, the updated version will be published on this page with a
                  new date. Material changes affecting existing enquiries will be communicated where
                  we have a way to reach you.
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
