import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import {
  contentPlainText,
  type ContentDocument,
} from "~/lib/content";
import { getPublishedHomepageEntrySafe } from "~/server/content/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const entry = await getPublishedHomepageEntrySafe();

  if (!entry) {
    return {
      title: { absolute: "Simply Code — Web Development Agency" },
      robots: { index: false, follow: false },
    };
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
  const entry = await getPublishedHomepageEntrySafe();

  if (!entry) {
    notFound();
  }

  return <CmsDocumentPage entry={entry} />;
}
