import type { MetadataRoute } from "next";
import { PROJECTS } from "~/content/projects";
import { contentHref, isHomepageCmsSlug } from "~/lib/content";
import { env } from "~/env";
import { listPublishedContentSafe } from "~/server/content/queries";
import { getPublicProjectsSafe } from "~/server/studio/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/work`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const projects = (await getPublicProjectsSafe()) ?? PROJECTS;
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const content = await listPublishedContentSafe();
  const contentRoutes: MetadataRoute.Sitemap = content
    .filter(
      (entry) => !(entry.kind === "page" && isHomepageCmsSlug(entry.slug)),
    )
    .map((entry) => ({
    url: `${base}${contentHref(entry.kind, entry.slug)}`,
    lastModified: entry.updatedAt,
    changeFrequency: entry.kind === "post" ? "monthly" : "yearly",
    priority: entry.kind === "post" ? 0.6 : 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...contentRoutes];
}
