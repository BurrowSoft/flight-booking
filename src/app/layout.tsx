import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, websiteJsonLd } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { detectCountry } from "@burrowsoft/shared";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Cheap Flights, Compare & Book`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cheap flights",
    "book flights",
    "compare flights",
    "flight deals",
    "airline tickets",
    "cheap airline tickets",
    "discount flights",
    "last minute flights",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Cheap Flights, Compare & Book`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Cheap Flights, Compare & Book`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currency = getCurrencyForCountry(country);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
            aria-label="Main navigation"
          >
            <Link href="/" className="flex items-center gap-2 font-bold text-sky-600 text-xl">
              <span aria-hidden>✈</span>
              {SITE_NAME}
            </Link>
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/flights/new-york-to-london" className="hover:text-sky-600 transition-colors">
                Popular Routes
              </Link>
              <Link href="/search?from=JFK&to=LHR&date=2025-12-25" className="hover:text-sky-600 transition-colors">
                Deals
              </Link>
            </div>
          </nav>
        </header>

        <CurrencyProvider currency={currency}>
        <main>{children}</main>
        </CurrencyProvider>

        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Popular Routes</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/flights/new-york-to-london" className="hover:text-sky-600">New York → London</Link></li>
                  <li><Link href="/flights/los-angeles-to-tokyo" className="hover:text-sky-600">Los Angeles → Tokyo</Link></li>
                  <li><Link href="/flights/new-york-to-paris" className="hover:text-sky-600">New York → Paris</Link></li>
                  <li><Link href="/flights/san-francisco-to-singapore" className="hover:text-sky-600">San Francisco → Singapore</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Destinations</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/flights/new-york-to-rome" className="hover:text-sky-600">Flights to Rome</Link></li>
                  <li><Link href="/flights/boston-to-madrid" className="hover:text-sky-600">Flights to Madrid</Link></li>
                  <li><Link href="/flights/chicago-to-frankfurt" className="hover:text-sky-600">Flights to Frankfurt</Link></li>
                  <li><Link href="/flights/seattle-to-amsterdam" className="hover:text-sky-600">Flights to Amsterdam</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Help</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><span className="text-slate-400">Baggage policy</span></li>
                  <li><span className="text-slate-400">Cancellations</span></li>
                  <li><span className="text-slate-400">Travel insurance</span></li>
                  <li><a href="mailto:support@flymole.com" className="hover:text-sky-600 transition-colors">support@flymole.com</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-sky-600">{SITE_NAME}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Compare hundreds of airlines in seconds. No hidden fees.
                </p>
              </div>
            </div>
            <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
