import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaSection } from "~/components/cta-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNav } from "~/components/site-nav";
import { PROJECTS, getAdjacentProjects, getProject } from "~/content/projects";
import { env } from "~/env";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.summary,
      type: "article",
      ...(project.image ? { images: [{ url: project.image, alt: project.title }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(project.slug);
  const url = `${env.NEXT_PUBLIC_SITE_URL}/work/${project.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url,
    creator: { "@type": "Organization", name: "Simply Code" },
    ...(project.image ? { image: `${env.NEXT_PUBLIC_SITE_URL}${project.image}` } : {}),
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

      <main id="main" className="bg-[#f7f4ee] text-[#15130f]">
        <section className="border-b border-[#15130f]/10 bg-[#f7f4ee] pt-8 pb-16 lg:pb-20">
          <div className="mx-auto max-w-[1400px] px-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase transition-colors hover:text-[#b8770a]"
            >
              <ArrowLeft className="size-3.5" /> All Work
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_0.5fr] lg:items-end">
              <div>
                <p className="text-[11px] font-bold tracking-[0.24em] text-[#b8770a] uppercase">
                  {project.client} · {project.year}
                </p>
                <h1 className="mt-4 max-w-4xl text-[clamp(2.2rem,5.2vw,4.2rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#57524a]">
                  {project.summary}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-6 border-t border-[#15130f]/15 pt-6 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:border-[#15130f]/15 lg:pt-0 lg:pl-8">
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                    Client
                  </dt>
                  <dd className="mt-1.5 text-[14px] font-semibold text-[#15130f]">
                    {project.client}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                    Engagement
                  </dt>
                  <dd className="mt-1.5 text-[14px] font-semibold text-[#15130f]">
                    {project.services.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                    Stack
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#15130f]/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative mt-12 aspect-[1000/560] overflow-hidden border border-[#15130f]/10 bg-gradient-to-br from-[#f0a500] to-[#e2761b]">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={`${project.title} website preview`}
                  fill
                  priority
                  sizes="(min-width: 1400px) 1352px, 100vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-6 text-center text-[clamp(1.6rem,4vw,3.2rem)] leading-none font-black tracking-[-0.04em] text-[#15130f]/85 uppercase">
                    {project.title}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.35fr_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#b8770a] uppercase">
                Case Study
              </p>
              <h2 className="mt-4 text-2xl leading-tight font-black tracking-tight uppercase">
                How the work
                <br />
                came together
              </h2>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="flex items-baseline gap-3 text-xl font-black tracking-tight uppercase">
                  <span className="text-[11px] font-bold text-[#b8770a]">01</span>
                  The Challenge
                </h3>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
                  {project.challenge}
                </p>
              </div>

              <div>
                <h3 className="flex items-baseline gap-3 text-xl font-black tracking-tight uppercase">
                  <span className="text-[11px] font-bold text-[#b8770a]">02</span>
                  What We Did
                </h3>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
                  {project.approach}
                </p>
              </div>

              <div>
                <h3 className="flex items-baseline gap-3 text-xl font-black tracking-tight uppercase">
                  <span className="text-[11px] font-bold text-[#b8770a]">03</span>
                  The Outcome
                </h3>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#57524a]">
                  {project.outcome}
                </p>
              </div>

              <div className="border-t border-[#15130f]/10 pt-8">
                <p className="text-[11px] font-bold tracking-[0.22em] text-[#b8770a] uppercase">
                  Services
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <li
                      key={service}
                      className="border border-[#15130f]/15 bg-[#f7f4ee] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#15130f] uppercase"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <nav aria-label="Project navigation" className="border-y border-[#15130f]/10 bg-[#f7f4ee]">
          <div className="mx-auto grid max-w-[1400px] divide-y divide-[#15130f]/10 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <Link
              href={`/work/${previous.slug}`}
              className="group flex items-center gap-4 py-8 sm:pr-8"
            >
              <ArrowLeft className="size-4 shrink-0 text-[#6f6a60] transition-transform group-hover:-translate-x-1" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                  Previous
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight uppercase transition-colors group-hover:text-[#b8770a]">
                  {previous.title}
                </p>
              </div>
            </Link>
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center justify-end gap-4 py-8 text-right sm:pl-8"
            >
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6f6a60] uppercase">
                  Next
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight uppercase transition-colors group-hover:text-[#b8770a]">
                  {next.title}
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

        <section className="bg-white pb-16">
          <div className="mx-auto max-w-[1400px] px-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#15130f] uppercase underline underline-offset-8 hover:text-[#b8770a]"
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
