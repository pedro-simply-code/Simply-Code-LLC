import type { Metadata } from "next";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import {
  contentPlainText,
  HOMEPAGE_CMS_SLUG,
  type ContentDocument,
} from "~/lib/content";
import { getPublishedEntrySafe } from "~/server/content/queries";
import { StaticHomePage } from "./static-home-page";

export const revalidate = 60;

const STATIC_HOME_METADATA: Metadata = {
  title: { absolute: "Simply Code — Web Development Agency" },
  description:
    "Web development agency specializing in UX design, custom Next.js platforms and WordPress solutions.",
  alternates: { canonical: "/" },
};

export async function generateMetadata(): Promise<Metadata> {
  const entry = await getPublishedEntrySafe("page", HOMEPAGE_CMS_SLUG);

  if (!entry) {
    return STATIC_HOME_METADATA;
  }

  const description =
    entry.excerpt ||
    contentPlainText(entry.body as ContentDocument).slice(0, 160);

  return {
    title: { absolute: `${entry.title} · Simply Code` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: entry.title,
      description,
      type: "website",
      ...(entry.coverImageUrl
        ? { images: [{ url: entry.coverImageUrl, alt: entry.title }] }
        : {}),
    },
  };
}

export default async function HomePage() {
  const entry = await getPublishedEntrySafe("page", HOMEPAGE_CMS_SLUG);

  if (entry) {
    return <CmsDocumentPage entry={entry} />;
  }

  return <StaticHomePage />;
}
