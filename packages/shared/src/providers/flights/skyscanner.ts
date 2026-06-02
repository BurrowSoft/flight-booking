import type { FlightProvider } from "./types";
import type { FlightSearchParams, Flight, Price } from "../../types";
import { getCurrencyForCountry } from "../../geo";

const BASE = "https://skyscanner-flights4.p.rapidapi.com/api/v1";

function price(amount: number, currency: string): Price {
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount),
  };
}

interface SkyLocation {
  entityId: string;
  skyId: string;
  name: string;
  iataCode?: string;
  cityName?: string;
  countryName?: string;
}

export class SkyscannerFlightProvider implements FlightProvider {
  readonly name = "Skyscanner";
  readonly supportedCountries: string[] = [];

  constructor(private readonly apiKey: string) {}

  private headers() {
    return {
      "x-rapidapi-host": "skyscanner-flights4.p.rapidapi.com",
      "x-rapidapi-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async search(params: FlightSearchParams): Promise<Flight[]> {
    const currency = params.currency || getCurrencyForCountry(params.country);
    const locale = "en-US";
    const market = params.country || "US";

    const [origin, destination] = await Promise.all([
      this.resolveLocation(params.origin, locale, market),
      this.resolveLocation(params.destination, locale, market),
    ]);
    if (!origin || !destination) return [];

    const searchParams = new URLSearchParams({
      fromEntityId: origin.entityId,
      toEntityId: destination.entityId,
      departDate: params.departureDate,
      currency,
      locale,
      market,
      adults: String(params.adults),
      cabinClass: params.cabinClass ?? "economy",
    });
    if (params.returnDate) searchParams.set("returnDate", params.returnDate);

    const res = await fetch(
      `${BASE}/flights/search?${searchParams.toString()}`,
      { headers: this.headers(), next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const itineraries: unknown[] = data?.data?.itineraries ?? data?.itineraries ?? [];

    return itineraries.slice(0, 20).map((it) => {
      const i = it as Record<string, unknown>;
      const legs = (i.legs as unknown[]) ?? [];
      const firstLeg = (legs[0] ?? {}) as Record<string, unknown>;
      const carriers = (firstLeg.carriers as Record<string, unknown>) ?? {};
      const marketing = ((carriers.marketing as unknown[]) ?? [])[0] as Record<string, unknown> | undefined;
      const pricingOptions = (i.pricingOptions as unknown[]) ?? [];
      const firstPrice = (pricingOptions[0] as Record<string, unknown> | undefined);
      const priceAmount = Number((firstPrice?.price as Record<string, unknown>)?.amount ?? 0);

      return {
        id: String(i.id ?? Math.random()),
        origin: {
          code: String(firstLeg.origin ?? params.origin),
          name: String(firstLeg.origin ?? ""),
          city: origin.cityName ?? params.origin,
          country: origin.countryName ?? "",
        },
        destination: {
          code: String(firstLeg.destination ?? params.destination),
          name: String(firstLeg.destination ?? ""),
          city: destination.cityName ?? params.destination,
          country: destination.countryName ?? "",
        },
        departureTime: String(firstLeg.departure ?? ""),
        arrivalTime: String(firstLeg.arrival ?? ""),
        airline: String(marketing?.name ?? ""),
        flightNumber: "",
        price: price(priceAmount, currency),
        durationMinutes: Number(firstLeg.durationInMinutes ?? 0),
        stops: Number(firstLeg.stopCount ?? 0),
        bookingUrl: String(firstPrice?.deepLink ?? "https://www.skyscanner.com"),
        provider: this.name,
      } satisfies Flight;
    });
  }

  private async resolveLocation(
    query: string,
    locale: string,
    market: string
  ): Promise<SkyLocation | null> {
    const res = await fetch(
      `${BASE}/autosuggest/flights?query=${encodeURIComponent(query)}&locale=${locale}&market=${market}`,
      { headers: this.headers(), next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const places: unknown[] = data?.places ?? data?.data?.places ?? [];
    const place = places.find(
      (p) => {
        const pp = p as Record<string, unknown>;
        return pp.type === "PLACE_TYPE_AIRPORT" || pp.type === "PLACE_TYPE_CITY";
      }
    ) as Record<string, unknown> | undefined ?? (places[0] as Record<string, unknown> | undefined);

    if (!place) return null;
    return {
      entityId: String(place.entityId ?? place.id ?? ""),
      skyId: String(place.skyId ?? ""),
      name: String(place.name ?? ""),
      cityName: String(place.cityName ?? place.name ?? ""),
      countryName: String(place.countryName ?? ""),
    };
  }
}
