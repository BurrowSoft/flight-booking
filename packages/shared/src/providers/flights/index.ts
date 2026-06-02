export { BookingComFlightProvider } from "./booking";
export { SkyscannerFlightProvider } from "./skyscanner";
export { AmadeusFlightProvider } from "./amadeus";
export type { FlightProvider } from "./types";

import { ProviderRouter } from "../base";
import { BookingComFlightProvider } from "./booking";
import { SkyscannerFlightProvider } from "./skyscanner";
import { AmadeusFlightProvider } from "./amadeus";
import type { FlightSearchParams, Flight } from "../../types";

export function createFlightRouter(): ProviderRouter<FlightSearchParams, Flight> {
  const providers = [];

  // Amadeus first — most reliable, real GDS data
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    providers.push(
      new AmadeusFlightProvider(
        process.env.AMADEUS_CLIENT_ID,
        process.env.AMADEUS_CLIENT_SECRET
      )
    );
  }
  if (process.env.SKYSCANNER_RAPIDAPI_KEY) {
    providers.push(new SkyscannerFlightProvider(process.env.SKYSCANNER_RAPIDAPI_KEY));
  }
  if (process.env.RAPIDAPI_KEY) {
    providers.push(new BookingComFlightProvider(process.env.RAPIDAPI_KEY));
  }

  return new ProviderRouter(providers);
}
