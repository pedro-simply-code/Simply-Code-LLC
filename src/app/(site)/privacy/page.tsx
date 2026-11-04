import type { Metadata } from "next";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { LegalDocumentSection } from "~/components/content/legal-document-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { DEFAULT_PRIVACY_DOCUMENT_SECTION } from "~/lib/content";
import { pageMetadata } from "~/lib/seo";
import { getPublishedCmsPageOverride } from "~/server/content/cms-site-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedCmsPageOverride("privacy");
  if (cms) {
    return pageMetadata({
      title: cms.title,
      description: cms.excerpt || cms.title,
      path: "/privacy",
    });
  }
  return pageMetadata({
    title: "Privacy Policy",
    description:
      "How Simply Code collects, uses and protects the information you share with us.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const cms = await getPublishedCmsPageOverride("privacy");
  if (cms) {
    return <CmsDocumentPage entry={cms} />;
  }

  return (
    <>
      <SiteNavShell />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <LegalDocumentSection data={DEFAULT_PRIVACY_DOCUMENT_SECTION} />
      </main>

      <SiteFooter />
    </>
  );
}
