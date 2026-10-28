import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE, getSiteUrl } from "@/lib/config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE.seoTitle,
  description: SITE.description,
  applicationName: `${SITE.businessName} — Customer Experience Documentation`,
  alternates: { canonical: SITE.homePath },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: `${SITE.businessName} — Customer Experience Documentation`,
    title: SITE.seoTitle,
    description: SITE.description,
    url: SITE.homePath,
  },
  twitter: {
    card: "summary",
    title: SITE.seoTitle,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  // Search Console verification.
  // 1) HTML-file method: public/googledc0c2b1b335e05db.html (byte-exact content).
  //    This is the method in use — do NOT add a meta tag for it.
  // 2) HTML-tag method (fallback only): set GOOGLE_SITE_VERIFICATION in
  //    .env.local to the content= token Search Console shows for the *tag*
  //    method (a long token, NOT the .html filename). When the env var is
  //    unset, no meta tag is emitted at all.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}