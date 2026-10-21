import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "~/components/site-nav";
import { cn } from "~/lib/utils";

type Project = {
  id: number;
  slug: string;
  image?: string;
  category: string;
  title: string;
  client: string;
  year: string;
  description: string;
  tags: string[];
};

const ALL_PROJECTS: Project[] = [
  {
    id: 1,
    slug: "harmony",
    image: "/work/harmony.jpg",
    category: "Next.js",
    title: "Harmony Educational Services - Platform Rebuild",
    client: "Harmony Educational Services",
    year: "2025 — Present",
    description: "Complete rebuild as full-stack developer, UX and systems architect. Dashboards for parents, schools, and employees with 120+ relational tables.",
    tags: ["UX Design", "Figma", "Next.js", "PostgreSQL", "Vercel"],
  },
  {
    id: 2,
    slug: "zoom",
    image: "/work/workspaces.jpg",
    category: "WordPress",
    title: "Zoom - WordPress Team Leadership",
    client: "Zoom",
    year: "2018 — 2025",
    description: "8 years managing development for the WordPress team, UX guidance, collaborating with designers, marketers, leadership and stakeholders.",
    tags: ["HTML", "CSS", "JS"],
  },
  {
    id: 3,
    slug: "zoomtopia",
    image: "/work/zoomtopia.jpg",
    category: "Marketing",
    title: "Zoomtopia Annual Brand Experiences",
    client: "Zoom",
    year: "2020 — 2025",
    description: "Five annual Zoomtopia brand experiences, each rebuilt from scratch with unique branded designs, attention to responsiveness and performance.",
    tags: ["WordPress", "ACF"],
  },
  {
    id: 4,
    slug: "cicero-group",
    image: "/work/cicero.jpg",
    category: "WordPress",
    title: "Cicero Group",
    client: "Cicero Group",
    year: "2020 — 2025",
    description: "Custom WordPress theme from provided designs, highly customizable templates using Bootstrap 4, ACF, and custom Visual Composer blocks.",
    tags: ["WordPress", "ACF"],
  },
  {
    id: 5,
    slug: "graphium-health",
    image: "/work/graphium.jpg",
    category: "WordPress",
    title: "Graphium Health",
    client: "Graphium Health",
    year: "Custom",
    description: "Custom WordPress theme development for healthcare organization with focus on performance and user experience.",
    tags: ["WordPress", "ACF"],
  },
  {
    id: 6,
    slug: "norton-transport",
    image: "/work/norton.jpg",
    category: "WordPress",
    title: "Norton Transport",
    client: "Norton Transport",
    year: "Custom",
    description: "Custom WordPress solution for transportation company with tailored functionality and design.",
    tags: ["WordPress", "ACF"],
  },
  {
    id: 7,
    slug: "novillus",
    category: "WordPress",
    title: "Novillus",
    client: "Novillus",
    year: "Custom",
    description: "Custom website development with exact fidelity to designs.",
    tags: ["WordPress", "Custom Theme"],
  },
  {
    id: 8,
    slug: "o-ventures",
    category: "WordPress",
    title: "O Ventures",
    client: "O Ventures",
    year: "Custom",
    description: "Custom WordPress development for venture capital firm.",
    tags: ["WordPress", "VC", "Custom Theme"],
  },
  {
    id: 9,
    slug: "marinaj-banquets",
    category: "WordPress",
    title: "Marinaj Banquets",
    client: "Marinaj Banquets",
    year: "Custom",
    description: "Custom WordPress website for event venue with booking functionality.",
    tags: ["WordPress", "Events", "Custom Theme"],
  },
  {
    id: 10,
    slug: "leadfox",
    category: "WordPress",
    title: "Leadfox",
    client: "Leadfox",
    year: "Custom",
    description: "WP hybrid on Bootstrap with user portal theme and WPML translation for French.",
    tags: ["WordPress", "Bootstrap", "WPML", "Portal"],
  },
  {
    id: 11,
    slug: "lemonade-stand",
    category: "Agency",
    title: "Lemonade Stand",
    client: "Lemonade Stand",
    year: "Agency",
    description: "Agency partnership project for marketing website development.",
    tags: ["WordPress", "Agency"],
  },
  {
    id: 12,
    slug: "thinker-ventures",
    category: "Agency",
    title: "Thinker Ventures",
    client: "Thinker Ventures",
    year: "Agency",
    description: "Agency partnership for venture capital website development.",
    tags: ["WordPress", "Agency"],
  },
];

const CATEGORIES = ["All", "Next.js", "WordPress", "Marketing", "Agency"];

export default function AllWorkPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#15130f] antialiased">
      <SiteNav />

      <section className="border-b border-[#15130f]/10">
        <div className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] uppercase transition-colors hover:text-[#b8770a]"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="mt-8">
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">Our Work</p>
            <h1 className="mt-5 text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.96] font-black tracking-[-0.04em] uppercase">
              All Projects
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#57524a]">
              A complete portfolio of web development projects we&apos;ve delivered. Filter by category to explore our work across different technologies and industries.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Filters */}
          <div className="mb-12 flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={cn(
                  "px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase transition-colors",
                  category === "All"
                    ? "bg-[#15130f] text-white"
                    : "border border-[#15130f]/25 hover:border-[#15130f] hover:bg-[#15130f] hover:text-white",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ALL_PROJECTS.map((project) => {
              return (
                <article
                  key={project.id}
                  className="group flex flex-col border border-[#15130f]/12 bg-white transition-shadow hover:shadow-[0_20px_60px_-30px_rgba(21,19,15,0.4)]"
                >
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
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
                        {project.client}
                      </span>
                      <span className="text-[11px] font-semibold tracking-[0.12em] text-[#6f6a60] uppercase">
                        {project.year}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg leading-snug font-bold tracking-tight transition-colors group-hover:text-[#b8770a]">
                      {project.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[#6f6a60]">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-[#15130f]/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-[#15130f] pt-12 text-white">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-8">
            <p className="text-xs text-white/35">© 2026 Simply Code. All rights reserved.</p>
            <p className="text-xs text-white/35">High-performance web development agency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
