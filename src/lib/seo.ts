import type { Metadata } from "next";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

/**
 * Per-page metadata with matching canonical, Open Graph and Twitter fields.
 * `metadataBase` is set once in the root layout, so paths stay relative.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
    },
    twitter: {
      title,
      description,
    },
  };
}
