import type { FlightProvider } from "./types";
import type { FlightSearchParams, Flight, Price } from "../../types";
import { getCurrencyForCountry } from "../../geo";

const BASE = "https://booking-com15.p.rapidapi.com/api/v1";

function price(amount: number, currency: string): Price {
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount),
  };
}

export class BookingComFlightProvider implements FlightProvider {
  readonly name = "Booking.com Flights";
  readonly supportedCountries: string[] = [];

  constructor(private readonly apiKey: string) {}

  private headers() {
    return {
      "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      "x-rapidapi-key": this.apiKey,
    };
  }

  async search(params: FlightSearchParams): Promise<Flight[]> {
    const currency = params.currency || getCurrencyForCountry(params.country);

    // Resolve origin airport
    const [fromAirport, toAirport] = await Promise.all([
      this.resolveAirport(params.origin),
      this.resolveAirport(params.destination),
    ]);
    if (!fromAirport || !toAirport) return [];

    const searchParams = new URLSearchParams({
      fromId: fromAirport.id,
      toId: toAirport.id,
      departDate: params.departureDate,
      adults: String(params.adults),
      children: String(params.children ?? 0),
      sort: "BEST",
      cabinClass: params.cabinClass?.toUpperCase() ?? "ECONOMY",
      currency_code: currency,
    });
    if (params.returnDate) searchParams.set("returnDate", params.returnDate);

    const res = await fetch(
      `${BASE}/flights/searchFlights?${searchParams.toString()}`,
      { headers: this.headers(), next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const itineraries: unknown[] = data?.data?.flightOffers ?? [];

    return itineraries.slice(0, 20).flatMap((offer) => {
      const o = offer as Record<string, unknown>;
      const segments = (o.segments as unknown[]) ?? [];
      return segments.map((seg) => {
        const s = seg as Record<string, unknown>;
        const dep = s.departureAirport as Record<string, unknown> | undefined;
        const arr = s.arrivalAirport as Record<string, unknown> | undefined;
        const priceInfo = o.priceBreakdown as Record<string, unknown> | undefined;
        const total = priceInfo?.total as Record<string, unknown> | undefined;

        return {
          id: `${String(o.token ?? "")}-${String(s.id ?? Math.random())}`,
          origin: {
            code: String(dep?.code ?? params.origin),
            name: String(dep?.name ?? ""),
            city: String(dep?.cityName ?? ""),
            country: String(dep?.countryName ?? ""),
          },
          destination: {
            code: String(arr?.code ?? params.destination),
            name: String(arr?.name ?? ""),
            city: String(arr?.cityName ?? ""),
            country: String(arr?.countryName ?? ""),
          },
          departureTime: String(s.departureTime ?? ""),
          arrivalTime: String(s.arrivalTime ?? ""),
          airline: String(s.airline ?? ""),
          flightNumber: String(s.flightNumber ?? ""),
          price: price(Number(total?.units ?? 0), currency),
          durationMinutes: Number(s.totalTime ?? 0),
          stops: Math.max(0, ((s.legs as unknown[]) ?? []).length - 1),
          bookingUrl: `https://www.booking.com/flights/`,
          provider: this.name,
        } satisfies Flight;
      });
    });
  }

  private async resolveAirport(query: string): Promise<{ id: string; name: string } | null> {
    const res = await fetch(
      `${BASE}/flights/searchDestination?query=${encodeURIComponent(query)}`,
      { headers: this.headers(), next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = (data?.data ?? []).find(
      (d: Record<string, unknown>) => d.type === "AIRPORT" || d.type === "CITY"
    ) as Record<string, unknown> | undefined;
    if (!result) return null;
    return { id: String(result.id ?? ""), name: String(result.name ?? "") };
  }
}
