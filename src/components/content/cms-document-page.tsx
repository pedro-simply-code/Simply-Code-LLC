import { ContentRenderer } from "~/components/content/content-renderer";
import {
  teamSectionFallbackMembers,
} from "~/components/content/team-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { PROJECTS } from "~/content/projects";
import {
  contentDocumentUsesBlockType,
  BLOG_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
  WORK_SECTION_NODE_TYPE,
  type ContentDocument,
} from "~/lib/content";
import type { ContentEntry } from "~/server/db/schema";
import { listPublishedEntriesSafe } from "~/server/content/queries";
import { getPublicAboutTeamSafe } from "~/server/profile/queries";
import { getPublicProjectsSafe } from "~/server/studio/queries";

/** Public layout for a published CMS page or post body (Lexical JSON). */
export async function CmsDocumentPage({ entry }: { entry: ContentEntry }) {
  const body = entry.body as ContentDocument;
  const needsTeam = contentDocumentUsesBlockType(body, TEAM_SECTION_NODE_TYPE);
  const needsWork = contentDocumentUsesBlockType(body, WORK_SECTION_NODE_TYPE);
  const needsBlog = contentDocumentUsesBlockType(body, BLOG_SECTION_NODE_TYPE);

  const [teamFromDb, projectsFromDb, blogPosts] = await Promise.all([
    needsTeam ? getPublicAboutTeamSafe() : Promise.resolve(null),
    needsWork ? getPublicProjectsSafe() : Promise.resolve(null),
    needsBlog ? listPublishedEntriesSafe("post") : Promise.resolve([]),
  ]);

  const workProjects = needsWork ? (projectsFromDb ?? PROJECTS) : [];

  return (
    <div
      id="main"
      className="bg-sc-canvas text-sc-ink min-h-screen antialiased"
    >
      <SiteNavShell />

      <article className="mx-auto w-full">
        <ContentRenderer
          document={body}
          teamMembers={teamFromDb ?? teamSectionFallbackMembers()}
          teamFromStudio={teamFromDb !== null}
          workProjects={workProjects}
          blogPosts={blogPosts}
        />
      </article>

      <SiteFooter />
    </div>
  );
}
