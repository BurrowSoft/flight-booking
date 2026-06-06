import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { headers } from "next/headers";
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
import { getMessages, getTranslations } from "next-intl/server";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, websiteJsonLd } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { detectCountry, AppHeader, AppFooter } from "@burrowsoft/shared";
import { Link } from "@/i18n/navigation";
import { LocaleSelector } from "@/components/LocaleSelector";
import { routing } from "@/i18n/routing";
import "../globals.css";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400","600","700"], variable: "--font-sarabun", display: "swap" });
const notoJP  = Noto_Sans_JP({ preload: false, weight: ["400","700"], variable: "--font-noto-jp", display: "swap" });
const notoSC  = Noto_Sans_SC({ preload: false, weight: ["400","700"], variable: "--font-noto-sc", display: "swap" });
const notoTC  = Noto_Sans_TC({ preload: false, weight: ["400","700"], variable: "--font-noto-tc", display: "swap" });
const notoKR  = Noto_Sans_KR({ preload: false, weight: ["400","700"], variable: "--font-noto-kr", display: "swap" });
const notoAR  = Noto_Sans_Arabic({ preload: false, weight: ["400","700"], variable: "--font-noto-ar", display: "swap" });

const ALL_FONT_VARS = [sarabun.variable, notoJP.variable, notoSC.variable, notoTC.variable, notoKR.variable, notoAR.variable].join(" ");

const LOCALE_FONT: Record<string, string> = {
  th: "var(--font-sarabun)",
  ja: "var(--font-noto-jp)",
  zh: "var(--font-noto-sc)",
  "zh-TW": "var(--font-noto-tc)",
  ko: "var(--font-noto-kr)",
  ar: "var(--font-noto-ar)",
};

const BASE = "https://www.flymole.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Cheap Flights, Compare & Book`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["cheap flights","book flights","compare flights","flight deals","airline tickets","cheap airline tickets","discount flights","last minute flights"],
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
  alternates: {
    canonical: `${BASE}/`,
    languages: Object.fromEntries(
      routing.locales.map(locale => [
        locale,
        locale === "en" ? `${BASE}/` : `${BASE}/${locale}/`,
      ])
    ),
  },
  other: { "google-adsense-account": "ca-pub-1009857008755875" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7",
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations("nav");

  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
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
        <meta name="verify-admitad" content="e1c747fd9a" />
      </head>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 antialiased"
        style={LOCALE_FONT[locale] ? { fontFamily: `${LOCALE_FONT[locale]}, ui-sans-serif, system-ui, sans-serif` } : undefined}
      >
        <NextIntlClientProvider messages={messages}>
          <AppHeader
            logo={
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/mascot.png" alt={SITE_NAME} width={40} height={40} className="shrink-0" priority />
                <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
              </Link>
            }
            right={
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
                  <Link href="/flights/new-york-to-london" className="hover:text-sky-600 transition-colors">
                    {t("popularRoutes")}
                  </Link>
                  <Link href="/search?from=JFK&to=LHR&date=2025-12-25" className="hover:text-sky-600 transition-colors">
                    {t("deals")}
                  </Link>
                </div>
                <LocaleSelector />
              </div>
            }
          />

          <CurrencyProvider currency={currency}>
            <main>{children}</main>
          </CurrencyProvider>

          <AppFooter
            supportEmail="support@flymole.com"
            accentHoverClass="hover:text-sky-600"
            currentSite="FlyMole"
          >
            <div className="grid grid-cols-2 gap-8 pb-4 sm:grid-cols-3">
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
                </ul>
              </div>
            </div>
          </AppFooter>

          {/* <RegionalFloatingAd /> */}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
