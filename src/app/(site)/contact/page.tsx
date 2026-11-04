import type { Metadata } from "next";
import { ContactSection } from "~/components/content/contact-section";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { DEFAULT_CONTACT_PAGE_SECTION } from "~/lib/content";
import { pageMetadata } from "~/lib/seo";
import { getPublishedCmsPageOverride } from "~/server/content/cms-site-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedCmsPageOverride("contact");
  if (cms) {
    return pageMetadata({
      title: cms.title,
      description: cms.excerpt || cms.title,
      path: "/contact",
    });
  }
  return pageMetadata({
    title: "Contact",
    description:
      "Tell us about your project. We reply within one business day with next steps, a scope and a fixed quote.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const cms = await getPublishedCmsPageOverride("contact");
  if (cms) {
    return <CmsDocumentPage entry={cms} />;
  }

  return (
    <>
      <SiteNavShell />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <ContactSection data={DEFAULT_CONTACT_PAGE_SECTION} />
      </main>

      <SiteFooter />
    </>
  );
}
