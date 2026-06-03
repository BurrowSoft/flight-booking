import { NextRequest, NextResponse } from "next/server";
import { createFlightRouter } from "@burrowsoft/shared";
import type { FlightSearchParams, Flight as SharedFlight } from "@burrowsoft/shared";
import { mapSharedFlight } from "@/lib/search";
import type { CabinClass } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const date = sp.get("date") ?? "";
  const adults = Math.max(1, parseInt(sp.get("adults") ?? "1", 10));
  const cabin = (sp.get("cabin") ?? "economy") as CabinClass;
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

  const map = (shared: SharedFlight[]) => shared.map(f => mapSharedFlight(f, cabin));

  if (providerName) {
    const target = available.find((p: { name: string }) => p.name === providerName);
    if (!target) {
      return NextResponse.json({ flights: [], provider: providerName });
    }
    try {
      const flights = map(await target.search(params));
      return NextResponse.json({ flights, provider: providerName });
    } catch (err) {
      console.error(`[/api/flights] ${providerName} threw:`, err);
      return NextResponse.json({ flights: [], provider: providerName, error: String(err) });
    }
  }

  try {
    const flights = map(await router.search(params, country));
    return NextResponse.json({ flights, provider: "all" });
  } catch (err) {
    console.error("[/api/flights] router.search threw:", err);
    return NextResponse.json({ flights: [], provider: "all", error: String(err) });
  }
}
