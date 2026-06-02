# FlyMole — TODO2 (Follow-up improvements)

Please fill in Reports2.md as usual when done

## Permissions
Ask the user to enable bypass permissions before starting: Claude Code settings → permission mode "bypass", or `claude --dangerously-skip-permissions`.

## Tasks

### 1. Deduplicate flights across providers — "N providers" badge
Currently the same physical flight can appear multiple times in results (once from Skyscanner, once from Booking.com, once from Kiwi). Requirements:
- After all providers resolve, group results by a dedup key: `{origin}_{destination}_{date}_{departureTime}_{arrivalTime}_{operatingCarrier}`
- For each group, keep the cheapest price; show a "Found on N providers" badge on the card
- The "Book on [Provider] ↗" buttons should show ALL providers for that flight, not just the cheapest — user can compare and pick
- Implement dedup in `src/app/search/FlightResults.tsx` (or wherever the results array is assembled client-side) after all provider fetches settle

### 2. Kiwi affiliate params — pending agreement
Kiwi Tequila portal (`tequila.kiwi.com`) does not accept self-service registration — access is invite/affiliate only. To unlock:
- Email `affiliates@kiwi.com` expressing interest
- Once a partner account is granted, add `KIWI_AFFILIATE_ID` env var to Vercel
- Update `KiwiFlightProvider.bookingUrl()` in `packages/shared/src/providers/flights/kiwi.ts` to append the affiliate marker to deep-link URLs

Until a Kiwi affiliate agreement is in place, the Kiwi provider still returns results — just without affiliate tracking on bookings.
