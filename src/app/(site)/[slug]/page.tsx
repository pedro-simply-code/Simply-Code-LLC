import { notFound, permanentRedirect } from "next/navigation";
import {
  isHomepageCmsSlug,
} from "~/lib/content";
import { getPublishedEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

type LegacyPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * CMS pages used to live at `/{slug}`. Keep old links working by sending them
 * to the current location at `/page/{slug}`.
 */
export default async function LegacyCmsPage({ params }: LegacyPageProps) {
  const { slug } = await params;
  const entry = await getPublishedEntrySafe("page", slug);

  if (!entry) notFound();

  if (isHomepageCmsSlug(entry.slug)) {
    permanentRedirect("/");
  }

  permanentRedirect(`/page/${entry.slug}`);
}
