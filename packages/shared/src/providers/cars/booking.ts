import type { CarProvider } from "./types";
import type { CarSearchParams, RentalCar, Price } from "../../types";
import { getCurrencyForCountry } from "../../geo";

function price(amount: number, currency: string): Price {
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount),
  };
}

function buildBookingCarsUrl(params: CarSearchParams): string {
  const base = "https://cars.booking.com/index.html";
  const q = new URLSearchParams({
    label: "burrowsoft-rentacarmole",
    lang: "en-us",
    pickup_location: params.pickupLocation,
    dropoff_location: params.dropoffLocation || params.pickupLocation,
    pickup_date: params.pickupDatetime.slice(0, 10),
    pickup_time: params.pickupDatetime.slice(11, 16),
    dropoff_date: params.dropoffDatetime.slice(0, 10),
    dropoff_time: params.dropoffDatetime.slice(11, 16),
    driver_age: String(params.driverAge),
  });
  return `${base}?${q.toString()}`;
}

export class BookingComCarProvider implements CarProvider {
  readonly name = "Booking.com Cars";
  readonly supportedCountries: string[] = [];

  constructor(private readonly apiKey: string) {}

  async search(params: CarSearchParams): Promise<RentalCar[]> {
    const currency = params.currency || getCurrencyForCountry(params.country);

    // The booking-com15 car rental search endpoint currently has reliability
    // issues at the backend level. We return an affiliate redirect car as a
    // fallback that links directly to Booking.com cars with params pre-filled.
    const bookingUrl = buildBookingCarsUrl(params);

    const days = Math.max(
      1,
      Math.round(
        (new Date(params.dropoffDatetime).getTime() - new Date(params.pickupDatetime).getTime()) /
          86400000
      )
    );

    return [
      {
        id: "booking-redirect",
        supplier: "Multiple Suppliers",
        category: "All Categories",
        model: "Compare 500+ rental cars",
        seats: 0,
        transmission: "automatic",
        pricePerDay: price(0, currency),
        totalPrice: price(0, currency),
        features: [
          "Free cancellation on most bookings",
          "No credit card fees",
          "Prices include taxes",
        ],
        bookingUrl,
        provider: this.name,
      },
    ];
    void days; // used for future live integration
  }
}
