import type { Flight } from "./types";

// ── Skyscanner ────────────────────────────────────────────────────────────────
// Apply at: partners.skyscanner.net
// Once approved you get an affiliateId to add here
function skyscannerUrl(flight: Flight, date: string): string {
  const fmt = date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${y.slice(2)}${m}${d}`);
  const base = `https://www.skyscanner.net/transport/flights/${flight.origin.code.toLowerCase()}/${flight.destination.code.toLowerCase()}/${fmt}/`;
  const id = process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID;
  return id ? `${base}?affiliateId=${id}` : base;
}

// ── Kayak ─────────────────────────────────────────────────────────────────────
// Apply at: kayak.com/affiliate
// Once approved, replace the utm_source value with your affiliate ID
function kayakUrl(flight: Flight, date: string, adults: number): string {
  const base = `https://www.kayak.com/flights/${flight.origin.code}-${flight.destination.code}/${date}/${adults}adults`;
  const params = new URLSearchParams({ fs: `airlines=${flight.airline.code}` });
  const id = process.env.NEXT_PUBLIC_KAYAK_AFFILIATE_ID;
  if (id) params.set("utm_source", id);
  return `${base}?${params}`;
}

// ── Travelpayouts ─────────────────────────────────────────────────────────────
// Sign up at: travelpayouts.com
// Get your marker (numeric ID) from the dashboard
function travelpayoutsUrl(flight: Flight, date: string, adults: number): string {
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;
  const params = new URLSearchParams({
    origin: flight.origin.code,
    destination: flight.destination.code,
    depart_date: date,
    adults: String(adults),
    currency: "usd",
    locale: "en",
    ...(marker ? { marker } : {}),
  });
  return `https://aviasales.com/search?${params}`;
}

// ── Google Flights ─────────────────────────────────────────────────────────────
// No affiliate program — keep as free fallback
function googleFlightsUrl(flight: Flight, date: string): string {
  const q = `flights from ${flight.origin.city} to ${flight.destination.city} on ${date} ${flight.airline.name}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export interface BookingOption {
  label: string;
  url: string;
  primary?: boolean;
  tracked: boolean; // whether this link earns affiliate revenue
}

export function getBookingOptions(
  flight: Flight,
  date: string,
  adults: number
): BookingOption[] {
  return [
    {
      label: `Book on Kayak`,
      url: kayakUrl(flight, date, adults),
      primary: true,
      tracked: !!process.env.NEXT_PUBLIC_KAYAK_AFFILIATE_ID,
    },
    {
      label: `Search on Skyscanner`,
      url: skyscannerUrl(flight, date),
      tracked: !!process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID,
    },
    {
      label: `Compare on Aviasales`,
      url: travelpayoutsUrl(flight, date, adults),
      tracked: !!process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER,
    },
    {
      label: `Google Flights`,
      url: googleFlightsUrl(flight, date),
      tracked: false,
    },
  ];
}
