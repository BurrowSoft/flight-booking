import type { Metadata } from "next";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightResultsView } from "@/components/FlightResultsView";
import { AIRPORTS } from "@/lib/data";
import { buildSearchMetadata } from "@/lib/seo";
import type { CabinClass } from "@/lib/types";
import { detectCountry, getCurrencyForCountry } from "@burrowsoft/shared";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
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
  const sp = await searchParams;
  const origin = AIRPORTS[sp.from?.toUpperCase() ?? ""] ?? null;
  const destination = AIRPORTS[sp.to?.toUpperCase() ?? ""] ?? null;

  if (!origin || !destination) {
    return { title: "Search Flights", robots: { index: false, follow: true } };
  }

  return buildSearchMetadata(origin.city, destination.city, sp.date ?? "");
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currency = locale === "th" ? "THB" : getCurrencyForCountry(country);

  const originCode = (sp.from ?? "JFK").toUpperCase();
  const destinationCode = (sp.to ?? "LHR").toUpperCase();
  const date = sp.date ?? new Date().toISOString().slice(0, 10);
  const returnDate = sp.return;
  const adults = Math.max(1, parseInt(sp.adults ?? "1", 10));
  const _cabin = (sp.cabin ?? "economy") as CabinClass; void _cabin;

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
        <FlightSearchForm
          compact
          initialFrom={originCode}
          initialTo={destinationCode}
          initialDate={date}
          initialReturn={returnDate}
          initialAdults={adults}
          initialTripType={returnDate ? "roundtrip" : "oneway"}
        />
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {origin?.city ?? originCode} → {destination?.city ?? destinationCode}
          {date && <span className="ml-2 text-base font-normal text-slate-500">{date}</span>}
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
