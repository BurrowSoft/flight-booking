import { NextRequest, NextResponse } from "next/server";
import { createFlightRouter } from "@burrowsoft/shared";
import type { FlightSearchParams } from "@burrowsoft/shared";

export const runtime = "nodejs";

// No unstable_cache here — providers already use next:{ revalidate } on their
// internal fetches, which is enough to avoid burning quota. unstable_cache was
// caching empty result arrays (caused by transient errors) for 5 min, making
// a failing search appear permanently empty until the TTL expired.

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

  const router = createFlightRouter();
  const available = router.getProvidersForCountry(country);

  if (available.length === 0) {
    console.error("[/api/flights] No providers configured — check KIWI_API_KEY, SKYSCANNER_RAPIDAPI_KEY, RAPIDAPI_KEY env vars");
    return NextResponse.json({ flights: [], provider: providerName ?? "all", error: "no_providers_configured" });
  }

  if (providerName) {
    const target = available.find((p: { name: string }) => p.name === providerName);
    if (!target) {
      return NextResponse.json({ flights: [], provider: providerName });
    }
    try {
      const flights = await target.search(params);
      return NextResponse.json({ flights, provider: providerName });
    } catch (err) {
      console.error(`[/api/flights] ${providerName} threw:`, err);
      return NextResponse.json({ flights: [], provider: providerName, error: String(err) });
    }
  }

  try {
    const flights = await router.search(params, country);
    return NextResponse.json({ flights, provider: "all" });
  } catch (err) {
    console.error("[/api/flights] router.search threw:", err);
    return NextResponse.json({ flights: [], provider: "all", error: String(err) });
  }
}
