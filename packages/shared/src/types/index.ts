export interface Price {
  amount: number;
  currency: string;
  formatted: string;
}

export interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

// ─── Flight ──────────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  cabinClass?: "economy" | "business" | "first";
  currency: string;
  country: string;
}

export interface Flight {
  id: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  price: Price;
  durationMinutes: number;
  stops: number;
  bookingUrl: string;
  provider: string;
}

// ─── Hotel ───────────────────────────────────────────────────────────────────

export interface HotelSearchParams {
  destination: string;
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  rooms: number;
  currency: string;
  country: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: GeoLocation;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  pricePerNight: Price;
  totalPrice: Price;
  images: string[];
  amenities: string[];
  bookingUrl: string;
  provider: string;
}

// ─── Car Rental ──────────────────────────────────────────────────────────────

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDatetime: string;
  dropoffDatetime: string;
  driverAge: number;
  currency: string;
  country: string;
}

export interface RentalCar {
  id: string;
  supplier: string;
  category: string;
  model: string;
  seats: number;
  transmission: "automatic" | "manual";
  pricePerDay: Price;
  totalPrice: Price;
  imageUrl?: string;
  features: string[];
  bookingUrl: string;
  provider: string;
}

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsSearchParams {
  query?: string;
  country?: string;
  language?: string;
  pageSize?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: string;
  provider: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface AISummary {
  summary: string;
  highlights: string[];
  recommendation: string;
  countryNote?: string;
}

export type SearchDomain = "flights" | "hotels" | "cars" | "news";
