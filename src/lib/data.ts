import type { Airline, Flight, PopularRoute, CabinClass } from "./types";
import { buildAirports } from "./buildAirports";

// 6,600+ airports from the airports npm package with city-name overrides
export const AIRPORTS = buildAirports();

export const AIRLINES: Record<string, Airline> = {
  AA: { code: "AA", name: "American Airlines", logo: "✈" },
  AC: { code: "AC", name: "Air Canada", logo: "✈" },
  AF: { code: "AF", name: "Air France", logo: "✈" },
  AI: { code: "AI", name: "Air India", logo: "✈" },
  AZ: { code: "AZ", name: "ITA Airways", logo: "✈" },
  BA: { code: "BA", name: "British Airways", logo: "✈" },
  CX: { code: "CX", name: "Cathay Pacific", logo: "✈" },
  DL: { code: "DL", name: "Delta Air Lines", logo: "✈" },
  EK: { code: "EK", name: "Emirates", logo: "✈" },
  ET: { code: "ET", name: "Ethiopian Airlines", logo: "✈" },
  EY: { code: "EY", name: "Etihad Airways", logo: "✈" },
  IB: { code: "IB", name: "Iberia", logo: "✈" },
  JL: { code: "JL", name: "Japan Airlines", logo: "✈" },
  KE: { code: "KE", name: "Korean Air", logo: "✈" },
  KL: { code: "KL", name: "KLM", logo: "✈" },
  LA: { code: "LA", name: "LATAM Airlines", logo: "✈" },
  LH: { code: "LH", name: "Lufthansa", logo: "✈" },
  MH: { code: "MH", name: "Malaysia Airlines", logo: "✈" },
  NH: { code: "NH", name: "All Nippon Airways", logo: "✈" },
  QF: { code: "QF", name: "Qantas", logo: "✈" },
  QR: { code: "QR", name: "Qatar Airways", logo: "✈" },
  SQ: { code: "SQ", name: "Singapore Airlines", logo: "✈" },
  TK: { code: "TK", name: "Turkish Airlines", logo: "✈" },
  UA: { code: "UA", name: "United Airlines", logo: "✈" },
  VS: { code: "VS", name: "Virgin Atlantic", logo: "✈" },
};

export const POPULAR_ROUTES: PopularRoute[] = [
  { originCode: "JFK", originCity: "New York", destinationCode: "LHR", destinationCity: "London", destinationCountry: "United Kingdom", slug: "new-york-to-london", minPrice: 389, durationHours: 7, image: "london" },
  { originCode: "LAX", originCity: "Los Angeles", destinationCode: "NRT", destinationCity: "Tokyo", destinationCountry: "Japan", slug: "los-angeles-to-tokyo", minPrice: 529, durationHours: 12, image: "tokyo" },
  { originCode: "JFK", originCity: "New York", destinationCode: "CDG", destinationCity: "Paris", destinationCountry: "France", slug: "new-york-to-paris", minPrice: 349, durationHours: 7, image: "paris" },
  { originCode: "MIA", originCity: "Miami", destinationCode: "CDG", destinationCity: "Paris", destinationCountry: "France", slug: "miami-to-paris", minPrice: 419, durationHours: 9, image: "paris" },
  { originCode: "SFO", originCity: "San Francisco", destinationCode: "SIN", destinationCity: "Singapore", destinationCountry: "Singapore", slug: "san-francisco-to-singapore", minPrice: 649, durationHours: 17, image: "singapore" },
  { originCode: "ORD", originCity: "Chicago", destinationCode: "FRA", destinationCity: "Frankfurt", destinationCountry: "Germany", slug: "chicago-to-frankfurt", minPrice: 429, durationHours: 9, image: "frankfurt" },
  { originCode: "JFK", originCity: "New York", destinationCode: "FCO", destinationCity: "Rome", destinationCountry: "Italy", slug: "new-york-to-rome", minPrice: 399, durationHours: 9, image: "rome" },
  { originCode: "LAX", originCity: "Los Angeles", destinationCode: "DXB", destinationCity: "Dubai", destinationCountry: "UAE", slug: "los-angeles-to-dubai", minPrice: 589, durationHours: 16, image: "dubai" },
  { originCode: "BOS", originCity: "Boston", destinationCode: "MAD", destinationCity: "Madrid", destinationCountry: "Spain", slug: "boston-to-madrid", minPrice: 359, durationHours: 7, image: "madrid" },
  { originCode: "SEA", originCity: "Seattle", destinationCode: "AMS", destinationCity: "Amsterdam", destinationCountry: "Netherlands", slug: "seattle-to-amsterdam", minPrice: 479, durationHours: 10, image: "amsterdam" },
  { originCode: "JFK", originCity: "New York", destinationCode: "NRT", destinationCity: "Tokyo", destinationCountry: "Japan", slug: "new-york-to-tokyo", minPrice: 599, durationHours: 14, image: "tokyo" },
  { originCode: "LAX", originCity: "Los Angeles", destinationCode: "SYD", destinationCity: "Sydney", destinationCountry: "Australia", slug: "los-angeles-to-sydney", minPrice: 749, durationHours: 15, image: "sydney" },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutes(baseHour: number, baseMin: number, duration: number) {
  const totalMinutes = baseHour * 60 + baseMin + duration;
  return { hour: Math.floor(totalMinutes / 60) % 24, minute: totalMinutes % 60 };
}

export function generateFlights(
  originCode: string,
  destinationCode: string,
  date: string,
  cabinClass: CabinClass = "economy"
): Flight[] {
  const origin = AIRPORTS[originCode.toUpperCase()];
  const destination = AIRPORTS[destinationCode.toUpperCase()];
  if (!origin || !destination) return [];

  const route = POPULAR_ROUTES.find(
    (r) => r.originCode === originCode.toUpperCase() && r.destinationCode === destinationCode.toUpperCase()
  );
  const baseDuration = (route?.durationHours ?? 8) * 60;
  const basePrice = route?.minPrice ?? 450;

  const cabinMultiplier: Record<CabinClass, number> = {
    economy: 1,
    premium_economy: 2.2,
    business: 4.5,
    first: 8,
  };

  const airlinePairs: [string, string[]][] = [
    ["AA", ["AA101", "AA203"]],
    ["BA", ["BA112", "BA178"]],
    ["DL", ["DL409", "DL501"]],
    ["UA", ["UA88", "UA144"]],
    ["LH", ["LH401", "LH455"]],
    ["EK", ["EK202", "EK208"]],
    ["QR", ["QR700", "QR702"]],
    ["VS", ["VS003", "VS025"]],
  ];

  return airlinePairs.map(([airlineCode, flightNums], i) => {
    const seed = i * 37 + originCode.charCodeAt(0) + destinationCode.charCodeAt(0) + (date ? date.charCodeAt(5) : 0);
    const rand = seededRandom(seed);

    const depHour = 6 + Math.floor(rand * 16);
    const depMin = [0, 15, 30, 45][Math.floor(rand * 4)] ?? 0;
    const durationVariance = Math.floor((seededRandom(seed + 1) - 0.5) * 60);
    const duration = baseDuration + durationVariance;
    const arr = addMinutes(depHour, depMin, duration);

    const priceVariance = 1 + (seededRandom(seed + 2) - 0.5) * 0.4;
    const price = Math.round(basePrice * priceVariance * cabinMultiplier[cabinClass]);
    const hasDiscount = seededRandom(seed + 3) > 0.7;
    const stops = seededRandom(seed + 4) > 0.6 ? 1 : 0;

    const amenities: string[] = ["Carry-on included"];
    if (cabinClass !== "economy") amenities.push("Extra legroom", "Meal included");
    if (cabinClass === "business" || cabinClass === "first") amenities.push("Lie-flat seat", "Lounge access");
    if (seededRandom(seed + 5) > 0.5) amenities.push("Wi-Fi available");

    return {
      id: `${airlineCode}-${flightNums[i % 2]}-${date}`,
      airline: AIRLINES[airlineCode] ?? { code: airlineCode, name: airlineCode, logo: "✈" },
      flightNumber: flightNums[i % 2] ?? `${airlineCode}100`,
      origin,
      destination,
      departureTime: formatTime(depHour, depMin),
      arrivalTime: formatTime(arr.hour, arr.minute),
      durationMinutes: duration,
      stops,
      stopCities: stops > 0 ? ["London"] : [],
      price,
      originalPrice: hasDiscount ? Math.round(price * 1.2) : undefined,
      currency: "USD",
      seatsLeft: Math.max(1, Math.floor(seededRandom(seed + 6) * 9)),
      cabinClass,
      amenities,
      bookingUrl: `https://www.google.com/travel/flights`,
      provider: "FlyMole",
    };
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
}

export function routeSlugToParams(slug: string): { origin: string; destination: string } | null {
  const route = POPULAR_ROUTES.find((r) => r.slug === slug);
  if (route) return { origin: route.originCode, destination: route.destinationCode };

  const parts = slug.split("-to-");
  if (parts.length !== 2) return null;
  const [originCity, destCity] = parts;
  const origin = Object.values(AIRPORTS).find(
    (a) => a.city.toLowerCase().replace(/\s+/g, "-") === originCity
  );
  const destination = Object.values(AIRPORTS).find(
    (a) => a.city.toLowerCase().replace(/\s+/g, "-") === destCity
  );
  if (!origin || !destination) return null;
  return { origin: origin.code, destination: destination.code };
}
