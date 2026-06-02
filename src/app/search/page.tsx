import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { SearchResults } from "@/components/SearchResults";
import { AIRPORTS } from "@/lib/data";
import { buildSearchMetadata } from "@/lib/seo";
import { searchFlights } from "@/lib/search";
import type { CabinClass } from "@/lib/types";
import { detectCountry, getCurrencyForCountry } from "@burrowsoft/shared";

interface SearchPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    adults?: string;
    cabin?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const origin = AIRPORTS[params.from?.toUpperCase() ?? ""] ?? null;
  const destination = AIRPORTS[params.to?.toUpperCase() ?? ""] ?? null;

  if (!origin || !destination) {
    return { title: "Search Flights", robots: { index: false, follow: true } };
  }

  return buildSearchMetadata(origin.city, destination.city, params.date ?? "");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currency = getCurrencyForCountry(country);

  const originCode = (params.from ?? "JFK").toUpperCase();
  const destinationCode = (params.to ?? "LHR").toUpperCase();
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const cabin = (params.cabin ?? "economy") as CabinClass;
  const adults = Math.max(1, parseInt(params.adults ?? "1", 10));

  const origin = AIRPORTS[originCode];
  const destination = AIRPORTS[destinationCode];

  const flights = await searchFlights(
    originCode,
    destinationCode,
    date,
    adults,
    cabin,
    country,
    currency
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li><Link href="/" className="hover:text-sky-600">Home</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-900 font-medium">
            {origin?.city ?? originCode} → {destination?.city ?? destinationCode}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <FlightSearchForm compact />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">
          Flights from {origin?.city ?? originCode} to {destination?.city ?? destinationCode}
          {date && (
            <span className="ml-2 text-base font-normal text-slate-500">on {date}</span>
          )}
        </h1>
        {flights.length > 0 && (
          <p className="text-sm text-slate-500">{flights.length} result{flights.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      <Suspense fallback={<div className="py-10 text-center text-slate-400">Loading flights…</div>}>
        {flights.length > 0 ? (
          <SearchResults
            flights={flights}
            originCity={origin?.city ?? originCode}
            destinationCity={destination?.city ?? destinationCode}
            date={date}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
            <p className="text-lg font-medium text-slate-400">No flights found for this route</p>
            <p className="mt-2 text-sm text-slate-400">Try different airports or dates</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Search again
            </Link>
          </div>
        )}
      </Suspense>
    </div>
  );
}
