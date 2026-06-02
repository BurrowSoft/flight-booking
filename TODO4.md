# FlyMole — TODO4: Thailand/SEA Region-Specific APIs

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports4.md when done.

## Overview
When a user is in Thailand or SEA, FlyMole should surface AirAsia fares (dominant low-cost carrier in the region) alongside Skyscanner and Booking.com. Travelpayouts is the recommended affiliate API — commission-based, no per-call fees, strong SEA coverage.

---

## What the user needs to arrange first

| Service | Registration | Notes |
|---|---|---|
| **Travelpayouts** | https://www.travelpayouts.com/en/ | Free affiliate network. Register, get API token. Covers AirAsia, Thai Airways, Nok Air, and all major airlines. |
| **AirAsia via Atlas** | https://www.atlas.com | Commercial agreement required for direct AirAsia API. Use Travelpayouts as the easier path first. |

New env vars to add to Vercel (flight-booking project):
- `TRAVELPAYOUTS_TOKEN` — API token from Travelpayouts dashboard
- `TRAVELPAYOUTS_MARKER` — your affiliate marker (already partially set as `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` for redirects — this is the server-side token for live search)

---

## Architecture
Add `TravelpayoutsFlightProvider` to the shared lib, gated on SEA countries for priority ordering (but can be enabled globally — Travelpayouts covers worldwide routes).

Country priority in `createFlightRouter(country)`:
```ts
// For TH, MY, SG, ID, PH, VN: put Travelpayouts first (best SEA fares)
// For all others: keep existing order (Kiwi → Skyscanner → Booking.com)
```

---

## Tasks

### 1. TravelpayoutsFlightProvider
File: `packages/shared/src/providers/flights/travelpayouts.ts`

Travelpayouts Flight Search API:
- Base URL: `https://api.travelpayouts.com/v1/`
- Auth: `token` query param or `X-Access-Token` header
- Cheapest tickets endpoint: `GET /prices/cheap?origin=BKK&destination=SIN&currency=thb&token=...`
- Flight search (calendar): `GET /prices/month-matrix?origin=BKK&destination=-&currency=thb&month=2026-07-01&token=...`
- Live search (Aviasales): `POST https://api.travelpayouts.com/v2/prices/latest` for recent prices
- Rate limit: 200 requests/hour on free tier
- Response: `{ data: { [destination]: { price, airline, departure_at, return_at, expires_at } } }`
- Normalize to `Flight` DTO — note: Travelpayouts returns aggregated cheapest prices per route, not individual flight legs

Deep-link format for "Book on Travelpayouts":
`https://www.aviasales.com/search/{ORIGIN}{YYYYMMDD}{DESTINATION}1` with affiliate marker appended

### 2. AirAsia affiliate links
Even without a direct AirAsia API, build AirAsia search deep-links for Thailand users:
- AirAsia search URL: `https://www.airasia.com/en/gb/search?origin={IATA}&destination={IATA}&departDate={YYYY-MM-DD}&adult=1`
- Add `AirAsiaAffiliateLink` as a CTA alongside real flight results when origin or destination is a Thai airport (BKK, DMK, HKT, CNX, USM)
- Register at https://www.airasia.com/en/gb/travel-deals/affiliate-programme.page for affiliate tracking

### 3. Thai airport priority in search suggestions
When locale is `th`, reorder airport autocomplete suggestions to show Thai airports first:
- Suvarnabhumi (BKK), Don Mueang (DMK), Phuket (HKT), Chiang Mai (CNX), Koh Samui (USM), Hat Yai (HDY), Krabi (KBV)

### 4. Update createFlightRouter to accept country
File: `packages/shared/src/providers/flights/index.ts`
- Accept optional `country` param
- When country is in SEA list: push Travelpayouts first, then Kiwi, Skyscanner, Booking.com
- Update `flight-booking/src/app/api/flights/route.ts` to pass country from `detectCountry(headers)`

### 5. Sync packages/shared to all other apps after changes
After editing any shared flight provider file, copy `packages/shared/` to: hotel-booking, news-feed, rent-a-car, main-website, games, shopping.
