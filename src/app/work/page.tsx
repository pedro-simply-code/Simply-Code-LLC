import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { WorkFilters } from "~/components/work-filters";
import { pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Selected projects: Next.js platform rebuilds, custom WordPress builds, event experiences and white-label agency work.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <SiteNav />

      <main id="main" className="bg-[#f7f4ee] text-[#15130f]">
        <section className="border-b border-[#15130f]/10 bg-[#f7f4ee] py-16 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-6">
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
              Portfolio
            </p>
            <h1 className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
              Work That Speaks
              <br />
              For Itself
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
              Platform rebuilds, custom WordPress themes and long-term partnerships. Every project
              below was designed, built or led by our team — no stock work, no invented results.
            </p>
          </div>
        </section>

        <section className="bg-[#f7f4ee] py-16 lg:py-20">
          <div className="mx-auto max-w-[1400px] px-6">
            <WorkFilters />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
