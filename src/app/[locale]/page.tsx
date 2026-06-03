import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { Price } from "@/components/Price";
import { AdUnit } from "@/components/AdUnit";
import { POPULAR_ROUTES } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Compare & Book Cheap Flights`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

const stats = [
  { value: "500+", label: "Airlines compared" },
  { value: "$0", label: "Booking fees" },
  { value: "2M+", label: "Happy travelers" },
  { value: "24/7", label: "Customer support" },
];

const features = [
  { icon: "🔍", title: "Compare 500+ Airlines", description: "We search hundreds of airlines and booking sites simultaneously to find you the lowest prices." },
  { icon: "💰", title: "Best Price Guarantee", description: "Found a lower price elsewhere? We'll match it. Pay no hidden fees or booking charges." },
  { icon: "⚡", title: "Instant Confirmation", description: "Book in seconds with instant confirmation. Receive your e-ticket directly to your inbox." },
  { icon: "🔔", title: "Price Alerts", description: "Set fare alerts for your route and get notified when prices drop." },
];

export default async function HomePage() {
  const t = await getTranslations("hero");
  const featuredRoutes = POPULAR_ROUTES.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-blue-700 pb-24 pt-16" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <h1 id="hero-heading" className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="mb-10 text-lg text-sky-100 sm:text-xl">{t("subtitle")}</p>
          <FlightSearchForm />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white" aria-label="Platform statistics">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-extrabold text-sky-600">{stat.value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14" aria-labelledby="routes-heading">
        <h2 id="routes-heading" className="mb-2 text-2xl font-bold text-slate-900">Popular Flight Routes</h2>
        <p className="mb-8 text-slate-500">Explore top destinations from cities across the US. Prices updated daily.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredRoutes.map((route) => (
            <Link
              key={route.slug}
              href={`/flights/${route.slug}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={`${route.originCity} to ${route.destinationCity}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{route.originCode} → {route.destinationCode}</span>
                <span className="text-xs text-slate-400">~{route.durationHours}h</span>
              </div>
              <p className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">{route.originCity} → {route.destinationCity}</p>
              <p className="text-xs text-slate-400">{route.destinationCountry}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xs text-slate-400">from</span>
                <span className="text-xl font-bold text-sky-600"><Price usd={route.minPrice} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-2">
        <AdUnit slot="HOME_BANNER_SLOT" format="horizontal" />
      </div>

      <section className="bg-white py-14" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="features-heading" className="mb-2 text-center text-2xl font-bold text-slate-900">Why Book with {SITE_NAME}?</h2>
          <p className="mb-10 text-center text-slate-500">We make finding and booking flights simple, fast, and affordable.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-1 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14" aria-labelledby="seo-content-heading">
        <h2 id="seo-content-heading" className="mb-4 text-xl font-bold text-slate-900">Cheap Flights — How to Find the Best Deals</h2>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-3">
          <p>Finding cheap flights doesn&apos;t have to be complicated. {SITE_NAME} searches across hundreds of airlines and travel sites simultaneously so you see all available options in one place.</p>
          <p>
            The best time to book a flight varies by route and season. For transatlantic flights
            (e.g., <Link href="/flights/new-york-to-london" className="text-sky-600 hover:underline">New York to London</Link> or{" "}
            <Link href="/flights/new-york-to-paris" className="text-sky-600 hover:underline">New York to Paris</Link>),
            booking 6–8 weeks in advance typically yields the lowest fares.
          </p>
          <p>Flexible travel dates can save you hundreds. Flying on Tuesdays and Wednesdays is generally cheaper than weekends.</p>
        </div>
      </section>
    </>
  );
}
