import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Sarabun,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_KR,
  Noto_Sans_Arabic,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, websiteJsonLd } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LanguageSelector, RegionalFloatingAd } from "@burrowsoft/shared";
import { detectCountry } from "@burrowsoft/shared";
import "./globals.css";

// preload:false on CJK/Arabic fonts — only activated per-locale, no reason to preload globally.
// next/font requires either subsets or preload:false when preload is enabled.
const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400","600","700"], variable: "--font-sarabun", display: "swap" });
const notoJP  = Noto_Sans_JP({ preload: false, weight: ["400","700"], variable: "--font-noto-jp", display: "swap" });
const notoSC  = Noto_Sans_SC({ preload: false, weight: ["400","700"], variable: "--font-noto-sc", display: "swap" });
const notoTC  = Noto_Sans_TC({ preload: false, weight: ["400","700"], variable: "--font-noto-tc", display: "swap" });
const notoKR  = Noto_Sans_KR({ preload: false, weight: ["400","700"], variable: "--font-noto-kr", display: "swap" });
const notoAR  = Noto_Sans_Arabic({ preload: false, weight: ["400","700"], variable: "--font-noto-ar", display: "swap" });

// All font variables injected on <html> so CSS can reference them regardless of locale
const ALL_FONT_VARS = [sarabun.variable, notoJP.variable, notoSC.variable, notoTC.variable, notoKR.variable, notoAR.variable].join(" ");

// Active font variable per locale (applied as font-family on <body>)
const LOCALE_FONT: Record<string, string> = {
  th: "var(--font-sarabun)",
  ja: "var(--font-noto-jp)",
  zh: "var(--font-noto-sc)",
  "zh-TW": "var(--font-noto-tc)",
  ko: "var(--font-noto-kr)",
  ar: "var(--font-noto-ar)",
};

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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FlyMole" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Cheap Flights, Compare & Book`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
  other: { "google-adsense-account": "ca-pub-1009857008755875" },
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
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const tFooter = await getTranslations("footer");

  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  // Task 6: when user has selected Thai locale, use THB; otherwise use country-based currency
  const currency = locale === "th" ? getCurrencyForCountry("TH") : getCurrencyForCountry(country);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={ALL_FONT_VARS}>
      <head>
        <meta name="agd-partner-manual-verification" />
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
        {locale === "th" && (
          <script async src="https://tp-em.com/NTM1Njcy.js?t=535672" />
        )}
        <meta name="fo-verify" content="bdce966d-7d2e-45a4-82d7-9a566f46d6ca" />
        <meta name="fo-verify" content="bbc63628-c7bf-452c-aa36-d70a12ac92ba" />
      </head>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 antialiased"
        style={LOCALE_FONT[locale] ? { fontFamily: `${LOCALE_FONT[locale]}, ui-sans-serif, system-ui, sans-serif` } : undefined}
      >
        <NextIntlClientProvider messages={messages}>
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <nav
              className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
              aria-label="Main navigation"
            >
              <Link href="/" className="flex items-center gap-2 font-bold text-sky-600 text-xl">
                <span aria-hidden>✈</span>
                {t("home")}
              </Link>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
                  <Link href="/flights/new-york-to-london" className="hover:text-sky-600 transition-colors">
                    {t("popularRoutes")}
                  </Link>
                  <Link href="/search?from=JFK&to=LHR&date=2025-12-25" className="hover:text-sky-600 transition-colors">
                    {t("deals")}
                  </Link>
                </div>
                <LanguageSelector locales={["en","th","es","ru","pt-BR","fr","ja","zh","zh-TW","ar","de","id","ko","it","vi"]} />
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
                  <a
                    href="https://burrowsoft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 flex items-center gap-2 group w-fit"
                    aria-label="BurrowSoft"
                  >
                    <svg width="20" height="20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden>
                      <ellipse cx="100" cy="115" rx="60" ry="55" fill="#1e293b" />
                      <ellipse cx="100" cy="100" rx="45" ry="45" fill="#334155" />
                      <ellipse cx="83" cy="95" rx="8" ry="10" fill="white" />
                      <ellipse cx="117" cy="95" rx="8" ry="10" fill="white" />
                      <circle cx="83" cy="96" r="4" fill="#0f172a" />
                      <circle cx="117" cy="96" r="4" fill="#0f172a" />
                      <rect x="50" y="150" width="100" height="20" rx="4" fill="#1e293b" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-sky-600 transition-colors">BurrowSoft</span>
                  </a>
                  <p className="mb-2 text-xs text-slate-400">{tFooter("tagline")}</p>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Other Products</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li><a href="https://bookingmole.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">BookingMole — Hotels</a></li>
                    <li><a href="https://insightmole.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">InsightMole — News</a></li>
                    <li><a href="https://rentacarmole.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">RentACarMole — Cars</a></li>
                    <li><a href="https://gamesmole.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">GamesMole — Games</a></li>
                    <li><a href="https://shoppingmole.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">ShoppingMole — Deals</a></li>
                  </ul>
                </div>
              </div>
              <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                {tFooter("copyright", { year: new Date().getFullYear() })}
              </p>
            </div>
          </footer>
          <RegionalFloatingAd />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
