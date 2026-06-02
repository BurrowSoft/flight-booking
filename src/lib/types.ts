export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  continent: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface FlightProviderOffer {
  provider: string;
  price: number;
  bookingUrl: string;
}

export interface Flight {
  id: string;
  airline: Airline;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopCities: string[];
  price: number;
  originalPrice?: number;
  currency: string;
  seatsLeft: number;
  cabinClass: CabinClass;
  amenities: string[];
  bookingUrl: string;
  provider: string;
  /** Populated after cross-provider deduplication. Present only when 2+ providers found the same flight. */
  allOffers?: FlightProviderOffer[];
}

export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type TripType = "roundtrip" | "oneway" | "multicity";
export type SortOption = "price" | "duration" | "departure" | "arrival";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  tripType: TripType;
}

export interface PopularRoute {
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  destinationCountry: string;
  slug: string;
  minPrice: number;
  durationHours: number;
  image: string;
}
