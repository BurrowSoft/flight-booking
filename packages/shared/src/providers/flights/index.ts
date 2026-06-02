export { BookingComFlightProvider } from "./booking";
export { SkyscannerFlightProvider } from "./skyscanner";
export type { FlightProvider } from "./types";

import { ProviderRouter } from "../base";
import { BookingComFlightProvider } from "./booking";
import { SkyscannerFlightProvider } from "./skyscanner";
import type { FlightSearchParams, Flight } from "../../types";

export function createFlightRouter(): ProviderRouter<FlightSearchParams, Flight> {
  const providers = [];

  if (process.env.RAPIDAPI_KEY) {
    providers.push(new BookingComFlightProvider(process.env.RAPIDAPI_KEY));
  }
  if (process.env.SKYSCANNER_RAPIDAPI_KEY) {
    providers.push(new SkyscannerFlightProvider(process.env.SKYSCANNER_RAPIDAPI_KEY));
  }

  return new ProviderRouter(providers);
}
