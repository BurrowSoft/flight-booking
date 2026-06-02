import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createFlightRouter } from "@burrowsoft/shared";
import type { FlightSearchParams } from "@burrowsoft/shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const date = sp.get("date") ?? "";
  const adults = Math.max(1, parseInt(sp.get("adults") ?? "1", 10));
  const cabin = sp.get("cabin") ?? "economy";
  const currency = sp.get("currency") ?? "USD";
  const country = sp.get("country") ?? "US";
  const providerName = sp.get("provider");

  if (!from || !to || !date) {
    return NextResponse.json({ error: "from, to and date are required" }, { status: 400 });
  }

  const params: FlightSearchParams = {
    origin: from.toUpperCase(),
    destination: to.toUpperCase(),
    departureDate: date,
    adults,
    cabinClass: cabin === "premium_economy" ? "economy" : (cabin as "economy" | "business" | "first"),
    currency,
    country,
  };

  const cacheKey = [from, to, date, adults, cabin, currency, country, providerName ?? "all"].join("|");

  const fetchFlights = unstable_cache(
    async () => {
      const router = createFlightRouter();

      if (providerName) {
        const available = router.getProvidersForCountry(country);
        const target = available.find((p: { name: string }) => p.name === providerName);
        if (!target) return [];
        try {
          return await target.search(params);
        } catch {
          return [];
        }
      }

      return router.search(params, country);
    },
    [cacheKey],
    { revalidate: 300 }
  );

  const flights = await fetchFlights();

  return NextResponse.json({ flights, provider: providerName ?? "all" });
}
