import { createFlightRouter } from "@burrowsoft/shared";
import type { Flight as SharedFlight } from "@burrowsoft/shared";
import type { Flight, CabinClass } from "./types";

const AIRLINE_LOGOS: Record<string, string> = {
  AA: "🔵", UA: "🔷", DL: "🟣", BA: "🔴", LH: "🟡", AF: "🔵",
  EK: "🟤", QR: "🟩", SQ: "🟦", CX: "🟠", LX: "⚪", KL: "🔵",
  IB: "🔴", TK: "🔴", NH: "🔵", JL: "🔴", AC: "🔴", WN: "🟡",
  B6: "🔵", AS: "🔵", F9: "🟢", NK: "🟡",
};

function toHHMM(isoOrTime: string): string {
  if (!isoOrTime) return "--:--";
  if (/^\d{2}:\d{2}/.test(isoOrTime)) return isoOrTime.slice(0, 5);
  const d = new Date(isoOrTime);
  if (isNaN(d.getTime())) return isoOrTime.slice(11, 16) || "--:--";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function defaultAmenities(cabin: CabinClass): string[] {
  if (cabin === "first") return ["Lie-flat seat", "Fine dining", "Lounge access", "Amenity kit"];
  if (cabin === "business") return ["Lie-flat seat", "Priority boarding", "Lounge access", "Extra baggage"];
  if (cabin === "premium_economy") return ["Extra legroom", "Dedicated cabin", "Priority boarding", "Meal included"];
  return ["Carry-on included", "In-flight entertainment", "Seat selection"];
}

export function mapSharedFlight(f: SharedFlight, cabin: CabinClass): Flight {
  const airlineCode = f.flightNumber.slice(0, 2).toUpperCase();
  return {
    id: f.id,
    airline: {
      code: airlineCode,
      name: f.airline || airlineCode,
      logo: f.airlineLogo ?? AIRLINE_LOGOS[airlineCode] ?? "✈️",
    },
    flightNumber: f.flightNumber || `${airlineCode}???`,
    origin: {
      code: f.origin.code,
      name: f.origin.name || f.origin.code,
      city: f.origin.city || f.origin.code,
      country: f.origin.country,
      continent: "",
      isPrimary: false,
      isoCountry: "",
    },
    destination: {
      code: f.destination.code,
      name: f.destination.name || f.destination.code,
      city: f.destination.city || f.destination.code,
      country: f.destination.country,
      continent: "",
      isPrimary: false,
      isoCountry: "",
    },
    departureTime: toHHMM(f.departureTime),
    arrivalTime: toHHMM(f.arrivalTime),
    durationMinutes: f.durationMinutes,
    stops: f.stops,
    stopCities: [],
    price: f.price.amount,
    currency: f.price.currency,
    seatsLeft: 9,
    cabinClass: cabin,
    amenities: defaultAmenities(cabin),
    bookingUrl: f.bookingUrl,
    provider: f.provider,
  };
}

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  adults: number,
  cabin: CabinClass,
  country: string,
  currency: string
): Promise<Flight[]> {
  const router = createFlightRouter();

  try {
    const results = await router.search(
      {
        origin,
        destination,
        departureDate,
        adults,
        cabinClass: cabin === "premium_economy" ? "economy" : cabin,
        currency,
        country,
      },
      country
    );
    return results.map((f: SharedFlight) => mapSharedFlight(f, cabin));
  } catch {
    return [];
  }
}
