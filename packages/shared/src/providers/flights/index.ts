export { BookingComFlightProvider } from "./booking";
export { SkyscannerFlightProvider } from "./skyscanner";
export { KiwiFlightProvider } from "./kiwi";
export type { FlightProvider } from "./types";

import { ProviderRouter } from "../base";
import { BookingComFlightProvider } from "./booking";
import { SkyscannerFlightProvider } from "./skyscanner";
import { KiwiFlightProvider } from "./kiwi";
import type { FlightSearchParams, Flight } from "../../types";

/** Strip BOM (﻿) and surrounding whitespace from env var values.
 *  Vercel env vars pasted from Windows editors can silently include a BOM,
 *  which makes them invalid HTTP header values (ByteString error). */
function cleanKey(raw: string | undefined): string | undefined {
  const s = raw?.replace(/^﻿/, "").trim();
  return s || undefined;
}

export function createFlightRouter(): ProviderRouter<FlightSearchParams, Flight> {
  const providers = [];

  const kiwiKey = cleanKey(process.env.KIWI_API_KEY);
  if (kiwiKey) {
    providers.push(new KiwiFlightProvider(kiwiKey, cleanKey(process.env.KIWI_AFFILIATE_ID)));
  }

  const skyscannerKey = cleanKey(process.env.SKYSCANNER_RAPIDAPI_KEY);
  if (skyscannerKey) {
    providers.push(new SkyscannerFlightProvider(skyscannerKey));
  }

  const rapidKey = cleanKey(process.env.RAPIDAPI_KEY);
  if (rapidKey) {
    providers.push(new BookingComFlightProvider(rapidKey));
  }

  return new ProviderRouter(providers);
}
