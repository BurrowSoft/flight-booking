import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getCachedFlightEditorial } from "@/lib/editorial";
import { FlightList } from "@/components/FlightList";
import { Price } from "@/components/Price";
import { generateFlights, POPULAR_ROUTES, AIRPORTS, routeSlugToParams } from "@/lib/data";
import {
  buildFlightRouteMetadata,
  breadcrumbJsonLd,
  flightRouteJsonLd,
  getAllRoutesSlugs,
  SITE_URL,
} from "@/lib/seo";
import { routing } from "@/i18n/routing";

interface RoutePageProps {
  params: Promise<{ locale: string; route: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    getAllRoutesSlugs().map(route => ({ locale, route }))
  );
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { route } = await params;
  const routeData = POPULAR_ROUTES.find((r) => r.slug === route);
  if (!routeData) return { title: "Route not found" };
  return buildFlightRouteMetadata(routeData.originCity, routeData.destinationCity, routeData.minPrice);
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { route } = await params;

  const routeData = POPULAR_ROUTES.find((r) => r.slug === route);
  const codes = routeData
    ? { origin: routeData.originCode, destination: routeData.destinationCode }
    : routeSlugToParams(route);

  if (!codes) notFound();

  const origin = AIRPORTS[codes.origin];
  const destination = AIRPORTS[codes.destination];
  if (!origin || !destination) notFound();

  const today = new Date().toISOString().split("T")[0] ?? "";
  const editorial = await getCachedFlightEditorial(origin.city, destination.city);
  const flights = generateFlights(codes.origin, codes.destination, today);
  const minPrice = routeData?.minPrice ?? Math.min(...flights.map((f) => f.price));

  const relatedRoutes = POPULAR_ROUTES.filter(
    (r) => r.originCode === codes.origin && r.slug !== route
  ).slice(0, 4);

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Flights", url: `${SITE_URL}/flights` },
    { name: `${origin.city} to ${destination.city}`, url: `${SITE_URL}/flights/${route}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flightRouteJsonLd(origin.city, destination.city, codes.origin, codes.destination, minPrice)) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-sky-600">Home</Link></li>
            <li aria-hidden>/</li>
            <li><span className="text-slate-900 font-medium">{origin.city} → {destination.city}</span></li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 px-6 py-10 text-white">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">{origin.city} to {destination.city}</h1>
              <p className="mt-1 text-sky-200">{origin.code} → {destination.code} · {destination.country}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  From <strong><Price usd={minPrice} /></strong>
                </span>
                {routeData && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">~{routeData.durationHours}h flight</span>
                )}
              </div>
            </div>
            <Link
              href={`/search?from=${codes.origin}&to=${codes.destination}&date=${today}`}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-sky-700 shadow-lg hover:bg-sky-50 transition-colors"
            >
              Search this route
            </Link>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Cheapest fare", value: <Price usd={minPrice} />, icon: "💰" },
            { label: "Flight time", value: routeData ? `~${routeData.durationHours}h` : "Varies", icon: "⏱" },
            { label: "Airlines", value: `${flights.length}+`, icon: "✈" },
            { label: "Direct flights", value: `${flights.filter((f) => f.stops === 0).length}`, icon: "📍" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-2xl">{item.icon}</div>
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <section aria-labelledby="flights-heading">
          <h2 id="flights-heading" className="mb-4 text-xl font-bold text-slate-900">
            Available Flights from {origin.city} to {destination.city}
          </h2>
          <FlightList flights={flights} />
        </section>


        <section className="mt-12 prose prose-slate max-w-none" aria-labelledby="route-info-heading">
          <h2 id="route-info-heading" className="text-xl font-bold text-slate-900">
            About Flights from {origin.city} to {destination.city}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              The {origin.city} ({origin.code}) to {destination.city} ({destination.code}) route
              is one of the most popular international routes.
              {routeData && ` The average flight time is approximately ${routeData.durationHours} hours.`}
            </p>
            <p>
              Typical fares for economy class start from <strong><Price usd={minPrice} /></strong>.
            </p>
            <p>{[...new Set(flights.map((f) => f.airline.name))].join(", ")} and more operate this route.</p>
          </div>
        </section>

        {editorial && (
          <section className="mt-8 max-w-2xl mx-auto px-4 py-6 text-slate-700 text-sm leading-relaxed">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              About flights from {origin.city} to {destination.city}
            </h2>
            <p>{editorial}</p>
          </section>
        )}

        {relatedRoutes.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-4 text-lg font-bold text-slate-900">More Flights from {origin.city}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedRoutes.map((r) => (
                <Link
                  key={r.slug}
                  href={`/flights/${r.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow hover:border-sky-200"
                >
                  <p className="font-medium text-slate-900">{r.originCity} → {r.destinationCity}</p>
                  <p className="mt-1 text-sm text-sky-600 font-semibold">from <Price usd={r.minPrice} /></p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
