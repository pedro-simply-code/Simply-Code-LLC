import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { PROJECTS, getAdjacentProjects, getProject } from "~/content/projects";
import {
  getApprovedReviewForProjectSlugSafe,
  getPublicProjectSafe,
  getPublicProjectsSafe,
} from "~/server/studio/queries";
import { env } from "~/env";
import { projectImageAbsolute } from "~/lib/project-image";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function liveSiteLabel(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    return "Open link";
  }
}

export const revalidate = 60;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getPublicProjectSafe(slug)) ?? getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} — Work`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} — Work`,
      description: project.summary,
      type: "article",
      ...(project.image ? { images: [{ url: project.image, alt: project.title }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [dbProject, clientReview] = await Promise.all([
    getPublicProjectSafe(slug),
    getApprovedReviewForProjectSlugSafe(slug),
  ]);
  const project = dbProject ?? getProject(slug);

  if (!project) {
    notFound();
  }

  const allProjects = (await getPublicProjectsSafe()) ?? PROJECTS;
  const index = allProjects.findIndex((item) => item.slug === project.slug);
  const previous =
    index > 0 ? allProjects[index - 1] : allProjects[allProjects.length - 1] ?? project;
  const next =
    index >= 0 && index < allProjects.length - 1 ? allProjects[index + 1] : allProjects[0] ?? project;
  const fallbackAdjacent = getAdjacentProjects(project.slug);
  const previousProject = previous ?? fallbackAdjacent.previous ?? project;
  const nextProject = next ?? fallbackAdjacent.next ?? project;
  const url = `${env.NEXT_PUBLIC_SITE_URL}/work/${project.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url,
    creator: { "@type": "Organization", name: "Simply Code" },
    ...(project.image ? { image: projectImageAbsolute(project.image, env.NEXT_PUBLIC_SITE_URL) } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Work", item: `${env.NEXT_PUBLIC_SITE_URL}/work` },
      {
        "@type": "ListItem",
        position: 2,
        name: project.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />

      <SiteNav />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <section className="border-b border-[#15130f]/10 bg-sc-section-alt pt-8 pb-16 lg:pb-20">
          <div className="mx-auto max-w-[1400px] px-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase transition-colors hover:text-sc-accent"
            >
              <ArrowLeft className="size-3.5" /> All Work
            </Link>

            <div className="mt-10 max-w-4xl">
              <p className="text-[11px] font-bold tracking-[0.24em] text-sc-accent uppercase">
                {project.client}
              </p>
              <h1 className="mt-4 text-[clamp(2.2rem,5.2vw,4.2rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                {project.title}
              </h1>
              <p className="mt-6 text-[17px] leading-relaxed text-[#57524a]">{project.summary}</p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,900px)_minmax(0,1fr)] lg:items-start lg:gap-10">
              <div className="relative aspect-[1000/560] w-full max-w-[900px] overflow-hidden border border-[#15130f]/10 bg-gradient-to-br from-sc-accent-bright to-sc-accent">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} website preview`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-6 text-center text-[clamp(1.4rem,3.5vw,2.4rem)] leading-none font-black tracking-[-0.04em] text-[#15130f]/85 uppercase">
                      {project.title}
                    </span>
                  </div>
                )}
              </div>

              <aside className="lg:pt-2">
                <dl className="grid gap-8 border-t border-[#15130f]/15 pt-8 lg:border-t-0 lg:pt-0">
                  <div>
                    <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                      Client
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-semibold text-[#15130f]">
                      {project.client}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                      Stack
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.length > 0 ? (
                        project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-[#15130f]/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[14px] text-[#6f6a60]">—</span>
                      )}
                    </dd>
                  </div>
                  {project.liveUrl ? (
                    <div>
                      <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                        Live site
                      </dt>
                      <dd className="mt-2">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#15130f] underline decoration-sc-accent/50 underline-offset-4 transition-colors hover:text-sc-accent"
                        >
                          {liveSiteLabel(project.liveUrl)}
                          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {clientReview ? (
                    <div>
                      <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                        Client review
                      </dt>
                      <dd className="mt-3 space-y-3">
                        <div
                          className="flex items-center gap-0.5 text-sc-accent-bright"
                          aria-label={`Rated ${clientReview.rating} out of 5`}
                        >
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`size-3.5 ${
                                index < clientReview.rating
                                  ? "fill-current"
                                  : "fill-transparent opacity-35"
                              }`}
                              aria-hidden
                            />
                          ))}
                        </div>
                        <blockquote className="text-[14px] leading-relaxed text-[#57524a]">
                          &ldquo;{clientReview.quote}&rdquo;
                        </blockquote>
                        <p className="text-[13px] font-semibold text-[#15130f]">
                          {clientReview.authorName}
                          <span className="font-normal text-[#6f6a60]"> · {project.client}</span>
                        </p>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </aside>
            </div>
          </div>
        </section>

        <nav aria-label="Project navigation" className="border-y border-[#15130f]/10 bg-sc-section-alt">
          <div className="mx-auto grid max-w-[1400px] divide-y divide-[#15130f]/10 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <Link
              href={`/work/${previousProject.slug}`}
              className="group flex items-center gap-4 py-8 sm:pr-8"
            >
              <ArrowLeft className="size-4 shrink-0 text-[#6f6a60] transition-transform group-hover:-translate-x-1" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                  Previous
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight uppercase transition-colors group-hover:text-sc-accent">
                  {previousProject.title}
                </p>
              </div>
            </Link>
            <Link
              href={`/work/${nextProject.slug}`}
              className="group flex items-center justify-end gap-4 py-8 text-right sm:pl-8"
            >
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                  Next
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight uppercase transition-colors group-hover:text-sc-accent">
                  {nextProject.title}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-[#6f6a60] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>

        <CtaSection
          title="Have a project like this?"
          description="Tell us what you are building. We will reply with an honest assessment, a scope and a fixed quote before anything starts."
        />

        <section className="bg-sc-section pb-16">
          <div className="mx-auto max-w-[1400px] px-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#15130f] uppercase underline underline-offset-8 hover:text-sc-accent"
            >
              Browse all work <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
