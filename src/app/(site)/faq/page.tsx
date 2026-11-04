import type { Metadata } from "next";
import { CtaSection } from "~/components/cta-section";
import { CmsDocumentPage } from "~/components/content/cms-document-page";
import { FaqPageSection } from "~/components/content/faq-page-section";
import { SiteFooter } from "~/components/site-footer";
import { SiteNavShell } from "~/components/site-nav-shell";
import { FAQ } from "~/content/faq";
import { DEFAULT_FAQ_SECTION } from "~/lib/content";
import { pageMetadata } from "~/lib/seo";
import { getPublishedCmsPageOverride } from "~/server/content/cms-site-page";

export const revalidate = 60;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedCmsPageOverride("faq");
  if (cms) {
    return pageMetadata({
      title: cms.title,
      description: cms.excerpt || cms.title,
      path: "/faq",
    });
  }
  return pageMetadata({
    title: "FAQ",
    description:
      "Answers about pricing, timelines, ownership, technologies, support and how to start a project with Simply Code.",
    path: "/faq",
  });
}

export default async function FaqPage() {
  const cms = await getPublishedCmsPageOverride("faq");
  if (cms) {
    return <CmsDocumentPage entry={cms} />;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <SiteNavShell />

      <main id="main" className="bg-sc-canvas text-[#15130f]">
        <FaqPageSection data={DEFAULT_FAQ_SECTION} />
        <CtaSection
          title="Still have a question?"
          description="Send it with your project details and we will answer both in one reply."
        />
      </main>

      <SiteFooter />
    </>
  );
}
