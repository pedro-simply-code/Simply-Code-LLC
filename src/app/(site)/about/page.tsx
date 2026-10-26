import Link from "next/link";
import { ArrowRight, Code2, MessageSquare, Ruler } from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { TeamGrid } from "~/components/team-grid";
import { TEAM } from "~/content/team";
import { SITE } from "~/content/site";
import { pageMetadata } from "~/lib/seo";
import {
  appOutlineButton,
  appPanel,
  appPanelMuted,
  appPrimaryButtonMarketing,
} from "~/lib/surface";
import { cn } from "~/lib/utils";
import { getPublicAboutTeamSafe } from "~/server/profile/queries";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Simply Code is a remote-first web development agency building custom platforms and websites since 2016. Meet the team and how we work.",
  path: "/about",
});

const STATS = [
  { value: "12+", label: "Years Experience" },
  { value: "64+", label: "Projects Delivered" },
  { value: "100%", label: "Job Success" },
  { value: "8+", label: "Years with Zoom" },
];

const VALUES = [
  {
    icon: Ruler,
    title: "Pixel-perfect from design",
    body: "Your designs built exactly as drawn. No drift, no surprises — exact fidelity has been our specialty since day one.",
  },
  {
    icon: Code2,
    title: "Clean, scalable code",
    body: "Built with best practices and modern technologies for long-term maintainability and growth, not just for launch day.",
  },
  {
    icon: MessageSquare,
    title: "Direct communication",
    body: "Talk directly to the developers building your project. No account managers, no middlemen, no miscommunication.",
  },
];

const PROCESS = [
  {
    title: "Discovery & scope",
    body: "We map the goals, audiences and constraints, then agree on a written scope with a fixed quote.",
  },
  {
    title: "UX & design",
    body: "Flows, wireframes and high-fidelity screens in Figma. Nothing is built before you approve the design.",
  },
  {
    title: "Build & integrate",
    body: "The people who designed it build it. Staging previews go out as sections are finished, not at the end.",
  },
  {
    title: "QA, launch & support",
    body: "Accessibility, performance and cross-browser checks before launch. Documentation and handover after.",
  },
];

export default async function AboutPage() {
  const teamFromDb = await getPublicAboutTeamSafe();
  const teamMembers = teamFromDb ?? TEAM;
  const teamFromStudio = teamFromDb !== null;
  return (
    <>
      <SiteNav />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                About Simply Code
              </p>
              <h1 className="mt-5 text-[clamp(2.5rem,5.6vw,4.6rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                A Small Team,
                <br />
                Senior Delivery
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#57524a]">
                Simply Code is a web development agency that has been building
                for the web since {SITE.founded}. We work remotely from
                Guatemala and the United States with clients, agencies and
                product teams that need design and engineering done properly.
              </p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#57524a]">
                We are deliberately small. The people who scope a project are
                the people who design and build it, which is why the work stays
                close to the plan and the communication stays direct.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className={appPrimaryButtonMarketing}>
                  Work With Us <ArrowRight className="size-4" />
                </Link>
                <Link href="/work" className={cn("gap-2", appOutlineButton)}>
                  See Our Work
                </Link>
              </div>
            </div>

            <div className={cn(appPanel, "p-8 lg:p-10")}>
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.22em] uppercase">
                At a glance
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[10px] font-bold tracking-[0.16em] text-[#6f6a60] uppercase">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-[34px] leading-none font-black tracking-[-0.02em] text-[#15130f]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 space-y-1.5 border-t border-[#15130f]/10 pt-6 text-[13px] text-[#57524a]">
                <p>{SITE.location}</p>
                <p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="hover:text-sc-accent"
                  >
                    {SITE.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-sc-section border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="mb-14 max-w-2xl">
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                What We Stand For
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                How We Work
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {VALUES.map((value) => (
                <div key={value.title} className={cn(appPanelMuted, "p-8")}>
                  <span className="flex size-12 items-center justify-center bg-[#15130f] text-white">
                    <value.icon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-black tracking-tight uppercase">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
                    {value.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="mb-14 max-w-2xl">
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                Process
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                From First Call
                <br />
                To Production
              </h2>
            </div>

            <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((step, index) => (
                <li
                  key={step.title}
                  className="border-t-2 border-[#15130f] pt-5"
                >
                  <span className="text-sc-accent text-[11px] font-bold tracking-[0.2em]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-2 text-base font-black tracking-tight uppercase">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#57524a]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="team"
          className="bg-sc-section scroll-mt-20 border-b border-[#15130f]/10 py-16 lg:py-24"
        >
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="mb-14 max-w-2xl">
              <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                Our Team
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                Meet The Experts
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                A dedicated team of developers and specialists committed to
                delivering exceptional results for every project.
              </p>
            </div>

            {teamMembers.length > 0 ? (
              <TeamGrid members={teamMembers} />
            ) : (
              <p
                className={cn(
                  appPanelMuted,
                  "px-6 py-12 text-center text-sm text-[#6f6a60]",
                )}
              >
                {teamFromStudio
                  ? "No studio team members yet. Add people in Studio → Team."
                  : "Team profiles are temporarily unavailable."}
              </p>
            )}
          </div>
        </section>

        <CtaSection title="Let's build something worth keeping." />
      </main>

      <SiteFooter />
    </>
  );
}
