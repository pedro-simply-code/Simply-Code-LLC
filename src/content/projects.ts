export type ProjectCategory = "Next.js" | "WordPress" | "Marketing" | "Agency";

export type Project = {
  slug: string;
  image?: string;
  category: ProjectCategory;
  title: string;
  client: string;
  year: string;
  summary: string;
  tags: string[];
  services: string[];
  challenge: string;
  approach: string;
  outcome: string;
  liveUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "harmony",
    image: "/work/harmony.jpg",
    category: "Next.js",
    title: "Harmony Educational Services",
    client: "Harmony Educational Services",
    year: "2025 — Present",
    summary:
      "Complete platform rebuild with dashboards for parents, schools and employees. 120+ relational tables architected from scratch.",
    tags: ["UX Design", "Figma", "Next.js", "PostgreSQL", "Vercel"],
    services: ["UX design", "Full-stack development", "Data architecture"],
    challenge:
      "Harmony needed to replace a fragmented set of tools with one platform serving three very different audiences — parents, schools and employees — without duplicating logic for each.",
    approach:
      "We started with the data model: 120+ relational tables designed around enrollment, people and reporting. The UX was designed and prototyped in Figma before implementation on Next.js and PostgreSQL, deployed on Vercel.",
    outcome:
      "One platform with role-based dashboards for every audience and a single source of truth for records.",
  },
  {
    slug: "zoom",
    image: "/work/workspaces.jpg",
    category: "WordPress",
    title: "Zoom — WordPress Team Leadership",
    client: "Zoom",
    year: "2018 — 2025",
    summary:
      "Eight years leading the WordPress team as development lead, with UX guidance across product and marketing properties.",
    tags: ["HTML", "CSS", "JS"],
    services: ["Development leadership", "UX guidance", "Release management"],
    challenge:
      "Zoom's teams needed consistent WordPress delivery across many stakeholders, designers and campaigns, with no room for drift between properties.",
    approach:
      "As development lead we ran delivery for the WordPress team: reviewing designs, managing implementation, coordinating releases and keeping the codebase consistent across teams.",
    outcome:
      "Eight years of continuous WordPress delivery at Zoom, with long-term stakeholder relationships.",
  },
  {
    slug: "zoomtopia",
    image: "/work/zoomtopia.jpg",
    category: "Marketing",
    title: "Zoomtopia Annual Brand Experiences",
    client: "Zoom",
    year: "2020 — 2025",
    summary:
      "Five annual Zoomtopia brand experiences, each rebuilt from scratch with a unique design and a focus on performance.",
    tags: ["WordPress", "ACF"],
    services: ["WordPress development", "Custom themes", "Performance"],
    challenge:
      "Every Zoomtopia needed a distinct brand experience, launched on a fixed event deadline, with no reuse of the previous year's design.",
    approach:
      "Each year we built a new custom WordPress theme around that year's design, keeping components maintainable and testing responsiveness and performance before launch.",
    outcome:
      "Five consecutive event sites shipped, each visually unique and built with performance in mind.",
  },
  {
    slug: "cicero-group",
    image: "/work/cicero.jpg",
    category: "WordPress",
    title: "Cicero Group",
    client: "Cicero Group",
    year: "2020 — 2025",
    summary:
      "Custom WordPress theme with Bootstrap 4, Advanced Custom Fields and custom Visual Composer blocks.",
    tags: ["WordPress", "ACF"],
    services: ["WordPress development", "Custom theme", "Editor experience"],
    challenge:
      "Cicero's marketing team needed to assemble pages themselves without engineering involvement, while keeping a custom design intact.",
    approach:
      "We built a custom Bootstrap 4 theme from the provided designs, modelled content with Advanced Custom Fields and added custom Visual Composer blocks for page assembly.",
    outcome:
      "A flexible editing experience with the design locked in, so the team can publish new pages without touching code.",
  },
  {
    slug: "graphium-health",
    image: "/work/graphium.jpg",
    category: "WordPress",
    title: "Graphium Health",
    client: "Graphium Health",
    year: "Custom",
    summary:
      "Healthcare platform on a custom WordPress theme, focused on performance and a clear content structure.",
    tags: ["WordPress", "ACF"],
    services: ["WordPress development", "Custom theme", "Performance"],
    challenge:
      "A healthcare product site has to be fast, clear and trustworthy, with no room for bloated plugins or layout drift.",
    approach:
      "A custom WordPress theme built around the content model, with attention to performance, accessibility and predictable templates.",
    outcome:
      "A lean, maintainable platform site built with performance and clear templates in mind.",
  },
  {
    slug: "norton-transport",
    image: "/work/norton.jpg",
    category: "WordPress",
    title: "Norton Transport",
    client: "Norton Transport",
    year: "Custom",
    summary:
      "Transportation company website with custom functionality tailored to how the business actually operates.",
    tags: ["WordPress", "ACF"],
    services: ["WordPress development", "Custom functionality", "Content modelling"],
    challenge:
      "Off-the-shelf themes could not express how Norton Transport actually operates.",
    approach:
      "We built a custom WordPress solution around their real workflows, modelling content and functionality to match the business instead of forcing plugin defaults.",
    outcome:
      "A site built around the operation's real workflows instead of forcing plugin defaults.",
  },
  {
    slug: "novillus",
    category: "WordPress",
    title: "Novillus",
    client: "Novillus",
    year: "Custom",
    summary: "Custom website development with exact fidelity to the provided designs.",
    tags: ["WordPress", "Custom Theme"],
    services: ["WordPress development", "Custom theme"],
    challenge: "The design was final and needed to be reproduced exactly, across breakpoints.",
    approach:
      "A custom WordPress build with careful attention to spacing, typography and responsive behaviour.",
    outcome: "A pixel-accurate implementation built on WordPress.",
  },
  {
    slug: "o-ventures",
    category: "WordPress",
    title: "O Ventures",
    client: "O Ventures",
    year: "Custom",
    summary: "Custom WordPress development for a venture capital firm.",
    tags: ["WordPress", "VC", "Custom Theme"],
    services: ["WordPress development", "Content modelling"],
    challenge:
      "A venture firm needed a custom website rather than an off-the-shelf theme.",
    approach:
      "A custom WordPress theme built around portfolio companies and team members.",
    outcome: "A custom WordPress site built to the firm's design.",
  },
  {
    slug: "marinaj-banquets",
    category: "WordPress",
    title: "MarinaJ Banquets",
    client: "MarinaJ Banquets",
    year: "Custom",
    summary: "Custom WordPress website for an event venue, built around enquiries and mobile browsing.",
    tags: ["WordPress", "Events", "Custom Theme"],
    services: ["WordPress development", "Custom theme"],
    challenge:
      "An event venue needed a custom site built to its own brand rather than a template.",
    approach:
      "Custom WordPress development based on the provided design, with mobile browsing in mind.",
    outcome: "A custom venue site built on WordPress.",
  },
  {
    slug: "leadfox",
    category: "WordPress",
    title: "Leadfox",
    client: "Leadfox",
    year: "Custom",
    summary:
      "WordPress hybrid on Bootstrap with a user portal theme and WPML translation for French.",
    tags: ["WordPress", "Bootstrap", "WPML", "Portal"],
    services: ["WordPress development", "Portal theme", "Multilingual"],
    challenge:
      "A hybrid product needed a user portal, multilingual content and a Bootstrap front end working together.",
    approach:
      "WordPress on Bootstrap with a custom portal theme and WPML for French translation.",
    outcome: "A bilingual product site with a user portal.",
  },
  {
    slug: "lemonade-stand",
    category: "Agency",
    title: "Lemonade Stand",
    client: "Lemonade Stand",
    year: "Agency",
    summary: "White-label development for a marketing agency, delivered under their brand.",
    tags: ["WordPress", "Agency"],
    services: ["White-label development", "WordPress development"],
    challenge:
      "An agency needed additional development capacity without adding headcount or exposing the handoff to clients.",
    approach:
      "White-label development, working inside their design and delivery process on an ongoing basis.",
    outcome: "A long-running white-label partnership under the agency's own brand.",
  },
  {
    slug: "thinker-ventures",
    category: "Agency",
    title: "Thinker Ventures",
    client: "Thinker Ventures",
    year: "Agency",
    summary: "Agency partnership for venture capital website development.",
    tags: ["WordPress", "Agency"],
    services: ["White-label development", "WordPress development"],
    challenge: "A venture firm needed a site delivered through an agency partner, on the partner's scope.",
    approach:
      "White-label WordPress development from the partner's designs and scope, with the partner owning the client relationship.",
    outcome: "Delivered as white-label work under the partner's brand.",
  },
];

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Next.js",
  "WordPress",
  "Marketing",
  "Agency",
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string): { previous: Project; next: Project } {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  const previous = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length] ?? PROJECTS[0]!;
  const next = PROJECTS[(index + 1) % PROJECTS.length] ?? PROJECTS[0]!;
  return { previous, next };
}
