import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlightList } from "@/components/FlightList";
import { Price } from "@/components/Price";
import { AdUnit } from "@/components/AdUnit";
import { generateFlights, POPULAR_ROUTES, AIRPORTS, routeSlugToParams } from "@/lib/data";
import {
  buildFlightRouteMetadata,
  breadcrumbJsonLd,
  flightRouteJsonLd,
  getAllRoutesSlugs,
  SITE_URL,
} from "@/lib/seo";

interface RoutePageProps {
  params: Promise<{ route: string }>;
}

// Pre-render all popular routes at build time (SSG = max SEO benefit)
export function generateStaticParams() {
  return getAllRoutesSlugs().map((slug) => ({ route: slug }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { route } = await params;
  const routeData = POPULAR_ROUTES.find((r) => r.slug === route);
  if (!routeData) return { title: "Route not found" };

  return buildFlightRouteMetadata(
    routeData.originCity,
    routeData.destinationCity,
    routeData.minPrice
  );
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
  const flights = generateFlights(codes.origin, codes.destination, today);
  const minPrice = routeData?.minPrice ?? Math.min(...flights.map((f) => f.price));

  const relatedRoutes = POPULAR_ROUTES.filter(
    (r) => r.originCode === codes.origin && r.slug !== route
  ).slice(0, 4);

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Flights", url: `${SITE_URL}/flights` },
    {
      name: `${origin.city} to ${destination.city}`,
      url: `${SITE_URL}/flights/${route}`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            flightRouteJsonLd(origin.city, destination.city, codes.origin, codes.destination, minPrice)
          ),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-sky-600">Home</Link></li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-slate-900 font-medium">
                {origin.city} → {destination.city}
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 px-6 py-10 text-white">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {origin.city} to {destination.city}
              </h1>
              <p className="mt-1 text-sky-200">
                {origin.code} → {destination.code} · {destination.country}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  From <strong><Price usd={minPrice} /></strong>
                </span>
                {routeData && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                    ~{routeData.durationHours}h flight
                  </span>
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

        {/* Quick info cards */}
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

        {/* Flight listings */}
        <section aria-labelledby="flights-heading">
          <h2 id="flights-heading" className="mb-4 text-xl font-bold text-slate-900">
            Available Flights from {origin.city} to {destination.city}
          </h2>
          <FlightList flights={flights} />
        </section>

        {/* Ad — between flight list and SEO content */}
        <AdUnit slot="ROUTE_MID_SLOT" format="horizontal" className="mt-8" />

        {/* SEO content */}
        <section className="mt-12 prose prose-slate max-w-none" aria-labelledby="route-info-heading">
          <h2 id="route-info-heading" className="text-xl font-bold text-slate-900">
            About Flights from {origin.city} to {destination.city}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              The {origin.city} ({origin.code}) to {destination.city} ({destination.code}) route
              is one of the most popular international routes. Multiple airlines operate daily
              nonstop and connecting flights, giving travelers plenty of options to find the
              cheapest fare.
            </p>
            <p>
              Typical fares for economy class start from <strong><Price usd={minPrice} /></strong>,
              though prices fluctuate based on season, how far in advance you book, and
              remaining seat availability.
              {routeData && ` The average flight time is approximately ${routeData.durationHours} hours.`}
            </p>
            <h3 className="text-base font-semibold text-slate-900 mt-4">
              Tips for cheap {origin.city} to {destination.city} flights
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Book 6–10 weeks in advance for the best economy fares</li>
              <li>Fly on Tuesdays or Wednesdays — typically cheaper than weekends</li>
              <li>Set a price alert to get notified when fares drop</li>
              <li>Compare nearby airports — sometimes a short drive saves hundreds</li>
              <li>Consider premium economy for longer flights — often better value than economy</li>
            </ul>
            <h3 className="text-base font-semibold text-slate-900 mt-4">
              Airlines flying {origin.city} to {destination.city}
            </h3>
            <p>
              {[...new Set(flights.map((f) => f.airline.name))].join(", ")} and more
              operate this route with various combinations of nonstop and one-stop itineraries.
            </p>
          </div>
        </section>

        {/* Related routes */}
        {relatedRoutes.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-4 text-lg font-bold text-slate-900">
              More Flights from {origin.city}
            </h2>
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
