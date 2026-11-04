import type { MetadataRoute } from "next";
import { contentPublicPath } from "~/lib/content";
import { env } from "~/env";
import { listPublishedContentSafe } from "~/server/content/queries";
import { getPublicProjectsSafe } from "~/server/studio/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const homepage: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  const projects = (await getPublicProjectsSafe()) ?? [];
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const content = await listPublishedContentSafe();
  const contentRoutes: MetadataRoute.Sitemap = content
    .filter((entry) => !(entry.kind === "page" && entry.isHomepage))
    .map((entry) => ({
      url: `${base}${contentPublicPath(entry.kind, entry.slug, entry.isHomepage)}`,
      lastModified: entry.updatedAt,
      changeFrequency: entry.kind === "post" ? "monthly" : "yearly",
      priority: entry.kind === "post" ? 0.6 : 0.5,
    }));

  return [...homepage, ...projectRoutes, ...contentRoutes];
}
