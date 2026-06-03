import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightResults } from "@/components/FlightResults";
import { AIRPORTS } from "@/lib/data";
import { buildSearchMetadata } from "@/lib/seo";
import type { CabinClass } from "@/lib/types";
import { detectCountry, getCurrencyForCountry, createFlightRouter } from "@burrowsoft/shared";
import { getLocale } from "next-intl/server";

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
  const locale = await getLocale();
  // Match the layout's currency logic: Thai locale always uses THB regardless of IP country
  const currency = locale === "th" ? "THB" : getCurrencyForCountry(country);

  const originCode = (params.from ?? "JFK").toUpperCase();
  const destinationCode = (params.to ?? "LHR").toUpperCase();
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const cabin = (params.cabin ?? "economy") as CabinClass;
  const adults = Math.max(1, parseInt(params.adults ?? "1", 10));

  const origin = AIRPORTS[originCode];
  const destination = AIRPORTS[destinationCode];

  // Resolve active provider names server-side so the client overlay knows what to show
  const router = createFlightRouter();
  const providerNames = router.getProvidersForCountry(country).map((p: { name: string }) => p.name);

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
          {origin?.city ?? originCode} → {destination?.city ?? destinationCode}
          {date && (
            <span className="ml-2 text-base font-normal text-slate-500">{date}</span>
          )}
        </h1>
      </div>

      <FlightResults
        query={{
          from: originCode,
          to: destinationCode,
          date,
          adults,
          cabin,
          currency,
          country,
        }}
        providerNames={providerNames}
        originCity={origin?.city ?? originCode}
        destinationCity={destination?.city ?? destinationCode}
      />
    </div>
  );
}
