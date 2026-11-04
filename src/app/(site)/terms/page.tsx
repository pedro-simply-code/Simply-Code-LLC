import type { Metadata } from "next";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { LegalDocumentSection } from "~/components/content/legal-document-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { DEFAULT_TERMS_DOCUMENT_SECTION } from "~/lib/content";
import { pageMetadata } from "~/lib/seo";
import { getPublishedCmsPageOverride } from "~/server/content/cms-site-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedCmsPageOverride("terms");
  if (cms) {
    return pageMetadata({
      title: cms.title,
      description: cms.excerpt || cms.title,
      path: "/terms",
    });
  }
  return pageMetadata({
    title: "Terms of Service",
    description:
      "Terms covering the use of the Simply Code website and the start of a project.",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const cms = await getPublishedCmsPageOverride("terms");
  if (cms) {
    return <CmsDocumentPage entry={cms} />;
  }

  return (
    <>
      <SiteNavShell />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <LegalDocumentSection data={DEFAULT_TERMS_DOCUMENT_SECTION} />
      </main>

      <SiteFooter />
    </>
  );
}
