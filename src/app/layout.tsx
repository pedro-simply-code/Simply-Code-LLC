import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "~/providers/providers";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Simply Code — Web Development Agency",
  description:
    "Web development agency specializing in UX design, custom Next.js platforms and WordPress solutions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
