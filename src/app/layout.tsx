import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { MaintenanceScreen } from "~/components/maintenance-screen";
import { isPublicMarketingPath } from "~/lib/public-paths";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { SITE } from "~/content/site";
import { env } from "~/env";
import { Providers } from "~/providers/providers";
import { siteSettingsHtmlProps } from "~/lib/site-settings";
import { getSiteSettings } from "~/server/site-settings/queries";
import "~/styles/globals.css";

export const dynamic = "force-dynamic";

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Simply Code — Web Development Agency",
    template: "%s · Simply Code",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: siteUrl,
    title: "Simply Code — Web Development Agency",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Simply Code — Web Development Agency",
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  url: siteUrl,
  email: SITE.email,
  description: SITE.description,
  foundingDate: SITE.founded,
  address: {
    "@type": "PostalAddress",
    ...SITE.address,
  },
  areaServed: ["United States", "Guatemala"],
  knowsAbout: [
    "UX design",
    "Next.js development",
    "React development",
    "PostgreSQL",
    "WordPress development",
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteSettings = await getSiteSettings();
  const siteHtmlProps = siteSettingsHtmlProps(siteSettings);
  const pathname = (await headers()).get("x-pathname") ?? "";
  const showMaintenance =
    siteSettings.maintenanceMode && isPublicMarketingPath(pathname);

  return (
    <html lang="en" suppressHydrationWarning {...siteHtmlProps}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {showMaintenance ? (
          <MaintenanceScreen message={siteSettings.maintenanceMessage} />
        ) : (
          <>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <Script
              id="organization-jsonld"
              type="application/ld+json"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
              }}
            />
            <Providers>{children}</Providers>
          </>
        )}
      </body>
    </html>
  );
}
