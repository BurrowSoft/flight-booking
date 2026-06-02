import type { FlightProvider } from "./types";
import type { FlightSearchParams, Flight, Price, Airport } from "../../types";
import { getCurrencyForCountry } from "../../geo";

const BASE = process.env.AMADEUS_HOSTNAME ?? "https://api.amadeus.com";
const TOKEN_URL = `${BASE}/v1/security/oauth2/token`;
const SEARCH_URL = `${BASE}/v2/shopping/flight-offers`;

function price(amount: number, currency: string): Price {
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount),
  };
}

// Module-level token cache — survives warm lambda re-use
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

// ─── Amadeus response shapes ──────────────────────────────────────────────────

interface AmadeusDictionaries {
  locations?: Record<string, { cityCode: string; countryCode: string }>;
  carriers?: Record<string, string>;
}

interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
  numberOfStops: number;
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

interface AmadeusOffer {
  id: string;
  itineraries: AmadeusItinerary[];
  price: { total: string; currency: string };
  validatingAirlineCodes: string[];
}

function isoToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}

function resolveAirport(
  iata: string,
  dicts: AmadeusDictionaries
): Airport {
  const loc = dicts.locations?.[iata];
  return {
    code: iata,
    name: iata,
    city: loc?.cityCode ?? iata,
    country: loc?.countryCode ?? "",
  };
}

const CABIN_MAP: Record<string, string> = {
  economy: "ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

export class AmadeusFlightProvider implements FlightProvider {
  readonly name = "Amadeus";
  readonly supportedCountries: string[] = [];

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async search(params: FlightSearchParams): Promise<Flight[]> {
    let token: string;
    try {
      token = await getToken(this.clientId, this.clientSecret);
    } catch {
      return [];
    }

    const currency = params.currency || getCurrencyForCountry(params.country);
    const cabinClass = CABIN_MAP[params.cabinClass ?? "economy"] ?? "ECONOMY";

    const query = new URLSearchParams({
      originLocationCode: params.origin.toUpperCase(),
      destinationLocationCode: params.destination.toUpperCase(),
      departureDate: params.departureDate,
      adults: String(params.adults),
      travelClass: cabinClass,
      currencyCode: currency,
      max: "20",
    });
    if (params.children) query.set("children", String(params.children));
    if (params.returnDate) query.set("returnDate", params.returnDate);

    const res = await fetch(`${SEARCH_URL}?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [];

    const body = await res.json() as {
      data: AmadeusOffer[];
      dictionaries: AmadeusDictionaries;
    };

    const { data = [], dictionaries = {} } = body;

    return data.map((offer) => {
      const outbound = offer.itineraries[0];
      const firstSeg = outbound.segments[0];
      const lastSeg = outbound.segments[outbound.segments.length - 1];
      const carrier = offer.validatingAirlineCodes[0] ?? firstSeg.carrierCode;
      const carrierName = dictionaries.carriers?.[carrier] ?? carrier;
      const total = parseFloat(offer.price.total);

      return {
        id: offer.id,
        origin: resolveAirport(firstSeg.departure.iataCode, dictionaries),
        destination: resolveAirport(lastSeg.arrival.iataCode, dictionaries),
        departureTime: firstSeg.departure.at,
        arrivalTime: lastSeg.arrival.at,
        airline: carrierName,
        flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
        price: price(total, offer.price.currency),
        durationMinutes: isoToMinutes(outbound.duration),
        stops: outbound.segments.length - 1,
        bookingUrl: `https://www.amadeus.com`,
        provider: this.name,
      } satisfies Flight;
    });
  }
}
