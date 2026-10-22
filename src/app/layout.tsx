import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SITE } from "~/content/site";
import { env } from "~/env";
import { Providers } from "~/providers/providers";
import "~/styles/globals.css";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
