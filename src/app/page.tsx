import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  Globe,
  Layers,
  Palette,
  Ruler,
  Users,
  Zap,
} from "lucide-react";
import { SiteNav } from "~/components/site-nav";
import { cn } from "~/lib/utils";

const SERVICES = [
  {
    icon: Palette,
    title: "UX & Design",
    description:
      "Full product design in Figma: research, user flows, interactive prototypes and complete design systems.",
    tools: [
      { label: "Figma", href: "https://www.figma.com/" },
      { label: "Prototyping" },
      { label: "Design Systems" },
    ],
  },
  {
    icon: Database,
    title: "Full Stack & Systems",
    description: "End-to-end platforms: relational data architecture, role-based permissions and real-time workflows.",
    tools: [
      { label: "Next.js", href: "https://nextjs.org/" },
      { label: "PostgreSQL", href: "https://www.postgresql.org/" },
      { label: "Vercel", href: "https://vercel.com/" },
    ],
  },
  {
    icon: Globe,
    title: "WordPress Development",
    description: "Custom themes built from scratch, plus builder-based builds with ACF, Bootstrap and Visual Composer.",
    tools: [
      { label: "ACF", href: "https://www.advancedcustomfields.com/" },
      { label: "Visual Composer", href: "https://visualcomposer.com/" },
      { label: "WPML", href: "https://wpml.org/" },
      { label: "Bootstrap", href: "https://getbootstrap.com/" },
    ],
  },
  {
    icon: Users,
    title: "Agency Partnerships",
    description: "White-label design and development for marketing and design agencies, built on long-term relationships.",
    tools: [
      { label: "Lemonade Stand", href: "https://www.lemonadestand.org/" },
      { label: "Thinker Ventures", href: "https://thinkerventures.com/" },
      { label: "Mod Creatives", href: "http://www.modcreatives.com/" },
      { label: "BTD Brand", href: "https://btdbrand.com/" },
    ],
  },
];

const STATS = [
  { value: "12+", label: "Years Experience" },
  { value: "64+", label: "Projects Delivered" },
  { value: "100%", label: "Job Success" },
  { value: "8+", label: "Years with Zoom" },
];

const STEP_STATUS = {
  done: { label: "✓ Done", tone: "text-white/30" },
  active: { label: "In Progress", tone: "text-[#f0a500]" },
  queued: { label: "Queued", tone: "text-white/20" },
} satisfies Record<string, { label: string; tone: string }>;

const BUILD_STEPS: { label: string; status: keyof typeof STEP_STATUS }[] = [
  { label: "Discovery & scope", status: "done" },
  { label: "UX design in Figma", status: "done" },
  { label: "Design approval", status: "done" },
  { label: "Content & assets", status: "done" },
  { label: "Build & integrate", status: "active" },
  { label: "Staging preview", status: "queued" },
  { label: "QA, tests & accessibility", status: "queued" },
  { label: "Performance & SEO audit", status: "queued" },
  { label: "Deploy & handover", status: "queued" },
];

const FEATURED_WORK = [
  {
    slug: "harmony",
    image: "/work/harmony.jpg",
    category: "Next.js",
    title: "Harmony Educational Services",
    description: "Complete platform rebuild with dashboards for parents, schools, and employees. 120+ relational tables architected from scratch.",
    year: "2025 — Present",
    tech: ["UX Design", "Figma", "Next.js", "PostgreSQL", "Vercel"],
  },
  {
    slug: "zoom",
    image: "/work/workspaces.jpg",
    category: "WordPress",
    title: "Zoom Platform Development",
    description: "8 years leading the WordPress team at Zoom, delivering UX guidance and development across multiple product areas.",
    year: "2018 — 2025",
    tech: ["HTML", "CSS", "JS"],
  },
  {
    slug: "zoomtopia",
    image: "/work/zoomtopia.jpg",
    category: "Marketing",
    title: "Zoomtopia Brand Experiences",
    description: "Five annual branded experiences rebuilt from scratch, each with unique design and optimized for performance.",
    year: "2020 — 2025",
    tech: ["WordPress", "ACF"],
  },
  {
    slug: "cicero-group",
    image: "/work/cicero.jpg",
    category: "WordPress",
    title: "Cicero Group",
    description: "Custom WordPress theme with Bootstrap 4, Advanced Custom Fields, and custom Visual Composer blocks.",
    year: "2020 — 2025",
    tech: ["WordPress", "ACF"],
  },
  {
    slug: "graphium-health",
    image: "/work/graphium.jpg",
    category: "WordPress",
    title: "Graphium Health",
    description: "Healthcare platform built with custom WordPress theme, optimized for performance and user experience.",
    year: "Custom",
    tech: ["WordPress", "ACF"],
  },
  {
    slug: "norton-transport",
    image: "/work/norton.jpg",
    category: "WordPress",
    title: "Norton Transport",
    description: "Transportation company website with custom functionality tailored to their business needs.",
    year: "Custom",
    tech: ["WordPress", "ACF"],
  },
];

// Everything under "my expertise" on ryanjhunter.com, split into design and build.
const TEAM_DESIGN = ["UX Design", "Figma", "Prototyping"];

const TEAM_TECH = [
  "AI Dev",
  "TSX",
  "CSS",
  "React.js",
  "Next.js",
  "PostgreSQL",
  "WordPress",
  "Bootstrap",
  "ACF",
  "Visual Composer",
  "WPML",
];

const TEAM = [
  {
    name: "Ryan",
    role: "Founder · UX & Developer",
    skills: [...TEAM_DESIGN, ...TEAM_TECH],
  },
  {
    name: "Gudiel",
    role: "Project Lead · Full Stack",
    skills: TEAM_TECH,
  },
  {
    name: "Pedro",
    role: "Full Stack Developer",
    skills: TEAM_TECH,
  },
  {
    name: "Santos",
    role: "Full Stack Developer",
    skills: TEAM_TECH,
  },
  {
    name: "Ecxal",
    role: "WordPress Specialist",
    skills: TEAM_TECH,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#15130f] antialiased">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#15130f]/10">
        <div className="mx-auto max-w-[1400px] px-6 py-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2.5 border border-[#15130f]/20 px-3.5 py-2">
                <span aria-hidden className="size-1.5 bg-[#f0a500]" />
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#b8770a] uppercase">
                  Web Development Agency
                </p>
              </div>

              <h1 className="mt-7 max-w-[26ch] text-[clamp(2.1rem,4vw,3.35rem)] leading-[1.06] font-black tracking-[-0.03em] uppercase">
                We build high-performance <span className="text-[#f0a500]">web solutions</span> that
                drive results
              </h1>

              <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.7] text-[#57524a]">
                A full-service digital agency specializing in UX design, custom Next.js applications,
                WordPress solutions and scalable web platforms.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-[#15130f] px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#b8770a]"
                >
                  Start Your Project <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#our-work"
                  className="inline-flex items-center gap-2 border border-[#15130f]/25 px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-[#15130f] uppercase transition-colors hover:border-[#f0a500] hover:bg-[#f0a500]/20 hover:text-[#15130f]"
                >
                  View Our Work
                </Link>
              </div>

              <p className="mt-9 border-l-2 border-[#f0a500] pl-4 text-[11px] leading-relaxed font-bold tracking-[0.14em] text-[#15130f]/70 uppercase">
                From first contact to production deploy
              </p>
            </div>

            <div className="relative overflow-hidden bg-[#15130f] p-7 text-white lg:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[#f0a500]/25 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="bg-[#f0a500] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
                    Since 2016
                  </span>
                </div>

                <p className="mt-8 max-w-[24ch] text-[17px] leading-snug font-black tracking-tight text-white uppercase lg:text-[19px]">
                  Clean code and business outcomes — not generic templates.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-8">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[34px] leading-none font-black tracking-[-0.02em] text-[#f0a500] lg:text-[40px]">
                        {stat.value}
                      </p>
                      <p className="mt-2.5 text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-b border-[#15130f]/10 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-16 max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
              Our Services
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              What We Do Best
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
              From product design and prototyping to full-stack builds, we deliver comprehensive digital
              services tailored to your business needs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group border border-[#15130f]/12 bg-[#f7f4ee] p-8 transition-all hover:border-[#f0a500] hover:shadow-[0_20px_60px_-30px_rgba(240,165,0,0.4)]"
                >
                  <div className="mb-6 flex size-14 items-center justify-center bg-[#15130f] text-white transition-colors group-hover:bg-[#f0a500] group-hover:text-[#15130f]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight uppercase">{service.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
                    {service.description}
                  </p>
                  <ul className="mt-5 space-y-1.5 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase">
                    {service.tools.map((tool) => (
                      <li key={tool.label}>
                        {tool.href ? (
                          <a
                            href={tool.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline-offset-2 transition-colors hover:text-[#b8770a] hover:underline"
                          >
                            {tool.label}
                          </a>
                        ) : (
                          <span>{tool.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OUR WORK */}
      <section id="our-work" className="border-b border-[#15130f]/10 py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
                Our Work
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                Featured Projects
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                A selection of our recent work showcasing the quality and diversity of solutions we deliver.
              </p>
            </div>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 border-b-2 border-[#15130f] pb-1 text-[12px] font-bold tracking-[0.18em] uppercase transition-colors hover:border-[#f0a500] hover:text-[#b8770a]"
            >
              View All Projects <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_WORK.map((project) => {
              return (
                <article key={project.title} className="group">
                  <div className="relative aspect-[1000/560] overflow-hidden bg-gradient-to-br from-[#f0a500] to-[#e2761b]">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={`${project.title} website preview`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-15">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
                          <div key={cell} className="bg-white/40" />
                        ))}
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#15130f] via-[#15130f]/85 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-coarse:hidden">
                      <p className="text-[10px] font-bold tracking-[0.22em] text-[#f0a500] uppercase">
                        Stack
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <li
                            key={tech}
                            className="border border-white/25 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white uppercase"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-[#b8770a]">
                        {project.title}
                      </h3>
                      <span className="text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
                        {project.year}
                      </span>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
                      {project.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2 pointer-fine:hidden">
                      {project.tech.map((tech) => (
                        <li
                          key={tech}
                          className="border border-[#15130f]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#57524a] uppercase"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#b8770a]"
            >
              See All Our Work <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OUR TEAM */}
      <section id="team" className="border-b border-[#15130f]/10 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-16 max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
              Our Team
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              Meet The Experts
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
              A dedicated team of developers and specialists committed to delivering exceptional
              results for every project.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="w-full border border-[#15130f]/12 bg-[#f7f4ee] p-8 text-center sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
              >
                <div className="mx-auto mb-6 flex size-24 items-center justify-center bg-gradient-to-br from-[#f0a500] to-[#e2761b]">
                  <Users className="size-12 text-white" />
                </div>
                <h3 className="text-xl font-black tracking-tight uppercase">{member.name}</h3>
                <p className="mt-2 text-[13px] font-semibold tracking-[0.12em] text-[#b8770a] uppercase">
                  {member.role}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-[#15130f]/20 px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="border-b border-[#15130f]/10 py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
                Why Choose Us
              </p>
              <h2 className="mt-5 text-[clamp(1.85rem,4.1vw,3.05rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase">
                Built For Performance,
                <br />
                Designed For Growth
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                We don&apos;t just build websites—we create digital solutions that perform. With direct
                communication to developers, proven processes, and a focus on clean code, we deliver
                results that last.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Ruler className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">Pixel-Perfect From Design</h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Your designs built exactly as drawn. No drift, no surprises — exact fidelity
                      has been our specialty since day one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">Clean, Scalable Code</h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Built with best practices and modern technologies for long-term
                      maintainability and growth.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">Direct Communication</h3>
                    <p className="text-[14px] leading-relaxed text-[#57524a]">
                      Talk directly to the developers building your project. No middlemen, no
                      miscommunication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15130f] text-white sm:min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                </div>
                <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/45 uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#f0a500]" />
                  Build In Progress
                </p>
              </div>

              <div className="relative flex-1 overflow-hidden p-5 font-mono text-[12px] leading-relaxed sm:p-6 sm:text-[13px]">
                <div className="sc-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-[#f0a500]/12 to-transparent" />
                <ul className="space-y-2.5">
                  {BUILD_STEPS.map((step) => {
                    const status = STEP_STATUS[step.status];
                    return (
                      <li key={step.label} className="flex items-center gap-3">
                        <span className="shrink-0 text-white/30">$</span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 break-words",
                            step.status === "queued" ? "text-white/40" : "text-white",
                          )}
                        >
                          {step.label}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[10px] font-bold tracking-[0.14em] uppercase",
                            status.tone,
                          )}
                        >
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-center gap-3">
                  <span className="shrink-0 text-white/30">$</span>
                  <span className="inline-block h-4 w-2 animate-pulse bg-[#f0a500]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
                Contact Us
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                Let&apos;s Talk About
                <br />
                Your Project
              </h2>
              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#57524a]">
                Ready to start your next web project? Tell us about your goals and we&apos;ll get back to
                you with a plan to bring your ideas to life.
              </p>
            </div>

            <div className="border border-[#15130f]/12 bg-[#f7f4ee] p-8 lg:p-10">
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="fullName"
                      className="text-[11px] font-bold tracking-[0.16em] uppercase"
                    >
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="w-full border border-[#15130f]/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0a500]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-[11px] font-bold tracking-[0.16em] uppercase"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full border border-[#15130f]/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0a500]"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="company"
                    className="text-[11px] font-bold tracking-[0.16em] uppercase"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="w-full border border-[#15130f]/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0a500]"
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service"
                    className="text-[11px] font-bold tracking-[0.16em] uppercase"
                  >
                    Service of Interest *
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    className="w-full border border-[#15130f]/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0a500]"
                  >
                    <option value="">Select a service</option>
                    <option value="ux-design">UX & Design</option>
                    <option value="full-stack">Full Stack & Systems</option>
                    <option value="wordpress-development">WordPress Development</option>
                    <option value="agency-partnerships">Agency Partnerships</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="projectDetails"
                    className="text-[11px] font-bold tracking-[0.16em] uppercase"
                  >
                    Project Details *
                  </label>
                  <textarea
                    id="projectDetails"
                    name="projectDetails"
                    required
                    rows={6}
                    className="w-full border border-[#15130f]/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0a500]"
                    placeholder="Tell us about your project, timeline, budget, or any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#b8770a] sm:w-auto"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#15130f] pt-16 text-white">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center bg-[#f0a500] font-mono leading-none font-bold tracking-[-0.08em] text-[#15130f]">
                  <span className="inline-block -rotate-45 text-[18px]">{"</>"}</span>
                </span>
                <span className="text-2xl leading-none font-black tracking-tight uppercase">
                  Simply <span className="text-[#f0a500]">Code</span>
                </span>
              </div>

              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/55">
                A full-service web development agency delivering custom solutions with clean code,
                exceptional performance, and a dedicated team.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#f0a500] uppercase">
                  Services
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li className="text-[14px] text-white/60">UX & Design</li>
                  <li className="text-[14px] text-white/60">Full Stack & Systems</li>
                  <li className="text-[14px] text-white/60">WordPress Development</li>
                  <li className="text-[14px] text-white/60">Agency Partnerships</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#f0a500] uppercase">
                  Company
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="#our-work" className="text-[14px] text-white/60 transition-colors hover:text-[#f0a500]">
                      Our Work
                    </Link>
                  </li>
                  <li className="text-[14px] text-white/60">Our Team</li>
                  <li>
                    <Link href="#contact" className="text-[14px] text-white/60 transition-colors hover:text-[#f0a500]">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#f0a500] uppercase">
                  Start a Project
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-white/60">
                  Have something in mind? Tell us about it and we&apos;ll reply with a plan.
                </p>
                <Link
                  href="#contact"
                  className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-white transition-colors hover:text-[#f0a500]"
                >
                  Request a quote <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-8">
            <p className="text-xs text-white/35">© 2026 Simply Code. All rights reserved.</p>
            <p className="text-xs text-white/35">High-performance web development agency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
