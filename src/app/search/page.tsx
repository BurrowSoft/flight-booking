import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightResultsView } from "@/components/FlightResultsView";
import { AIRPORTS } from "@/lib/data";
import { buildSearchMetadata } from "@/lib/seo";
import type { CabinClass } from "@/lib/types";
import { detectCountry, getCurrencyForCountry } from "@burrowsoft/shared";
import { getLocale } from "next-intl/server";

interface SearchPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    return?: string;
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
  const currency = locale === "th" ? "THB" : getCurrencyForCountry(country);

  const originCode = (params.from ?? "JFK").toUpperCase();
  const destinationCode = (params.to ?? "LHR").toUpperCase();
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const returnDate = params.return;
  const adults = Math.max(1, parseInt(params.adults ?? "1", 10));
  // cabin kept for metadata / future use
  const _cabin = (params.cabin ?? "economy") as CabinClass; void _cabin;

  const origin = AIRPORTS[originCode];
  const destination = AIRPORTS[destinationCode];

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

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {origin?.city ?? originCode} → {destination?.city ?? destinationCode}
          {date && (
            <span className="ml-2 text-base font-normal text-slate-500">{date}</span>
          )}
        </h1>
      </div>

      <FlightResultsView
        from={originCode}
        to={destinationCode}
        date={date}
        returnDate={returnDate}
        adults={adults}
        locale={locale}
        country={country}
        currency={currency}
      />
    </div>
  );
}
