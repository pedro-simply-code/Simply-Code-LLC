import "server-only";

import { unstable_cache } from "next/cache";
import type { Project as ContentProject } from "~/content/projects";
import {
  getApprovedReviewForProjectSlug,
  getPublicProject,
  getPublicProjects,
} from "~/server/studio/queries";

const PUBLIC_REVALIDATE_SECONDS = 300;

export const getCachedPublicProjects = unstable_cache(
  async (): Promise<ContentProject[]> => getPublicProjects(),
  ["public-projects"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["public-projects"] },
);

export function getCachedPublicProject(slug: string) {
  return unstable_cache(
    async (): Promise<ContentProject | null> => getPublicProject(slug),
    ["public-project", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["public-projects", `public-project:${slug}`],
    },
  )();
}

export function getCachedApprovedReviewForProjectSlug(slug: string) {
  return unstable_cache(
    async () => getApprovedReviewForProjectSlug(slug),
    ["public-project-review", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["public-projects", `public-project:${slug}`],
    },
  )();
}

export async function getPublicProjectsSafe(): Promise<
  ContentProject[] | null
> {
  try {
    const rows = await getCachedPublicProjects();
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export async function getPublicProjectSafe(
  slug: string,
): Promise<ContentProject | null> {
  try {
    return await getCachedPublicProject(slug);
  } catch {
    return null;
  }
}

export async function getApprovedReviewForProjectSlugSafe(slug: string) {
  try {
    return await getCachedApprovedReviewForProjectSlug(slug);
  } catch {
    return null;
  }
}
