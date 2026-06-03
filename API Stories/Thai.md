# FlyMole — Thailand / SEA API Integration

> Work on this AFTER localisation (TODO4) is complete.

## What the user needs to arrange first

| Service | Registration | Notes |
|---|---|---|
| **Travelpayouts** | https://www.travelpayouts.com/en/ | Free affiliate network. Covers AirAsia, Thai Airways, Nok Air, and all major airlines. Single registration covers global routes. |
| **AirAsia affiliate** | https://www.airasia.com/en/gb/travel-deals/affiliate-programme.page | For AirAsia-specific deep-links with tracking. |
| **AirAsia via Atlas** | https://www.atlas.com | Commercial agreement required for direct AirAsia live-search API. Lower priority — use Travelpayouts first. |

New env vars (Vercel, flight-booking project):
- `TRAVELPAYOUTS_TOKEN` — server-side API token
- `TRAVELPAYOUTS_MARKER` — affiliate marker (already partially set as `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` for redirects)

## Architecture

Add `TravelpayoutsFlightProvider` gated on env var. SEA country priority order in `createFlightRouter(country)`:
```
TH, MY, SG, ID, PH, VN → Travelpayouts first, then Kiwi → Skyscanner → Booking.com
All others → Kiwi → Skyscanner → Booking.com
```

## Tasks

### 1. TravelpayoutsFlightProvider
File: `packages/shared/src/providers/flights/travelpayouts.ts`
- Base URL: `https://api.travelpayouts.com/v1/`
- Auth: `X-Access-Token: {TRAVELPAYOUTS_TOKEN}` header
- Cheapest tickets: `GET /prices/cheap?origin=BKK&destination=-&currency=thb&token=...`
- Rate limit: 200 requests/hour on free tier
- Returns aggregated cheapest prices per route (not individual legs) — normalize to `Flight` DTO
- Deep-link: `https://www.aviasales.com/search/{ORIGIN}{YYYYMMDD}{DESTINATION}1?marker={MARKER}`

### 2. AirAsia affiliate deep-link CTA
When origin or destination is a Thai airport (BKK, DMK, HKT, CNX, USM, HDY, KBV):
- Show "Also check AirAsia ↗" button linking to:
  `https://www.airasia.com/en/gb/search?origin={IATA}&destination={IATA}&departDate={YYYY-MM-DD}&adult=1`

### 3. Thai airport priority in search autocomplete
When locale is `th` / country is `TH`, show first:
- Suvarnabhumi (BKK), Don Mueang (DMK), Phuket (HKT), Chiang Mai (CNX), Koh Samui (USM), Hat Yai (HDY), Krabi (KBV)

### 4. Update createFlightRouter to accept country
- Accept optional `country` param
- Gate SEA priority on country list
- Pass country from `detectCountry(headers)` in `/api/flights/route.ts`

### 5. Sync packages/shared after changes
Copy `packages/shared/` to: hotel-booking, news-feed, rent-a-car, main-website, games, shopping.

---

## Ikhlas Travel Affiliate (pending approval)
- Registered via the same partner portal as AirAsia
- Muslim-friendly travel brand — relevant for TH south, MY, ID markets
- Once approved: add script/widget injection in `TravelpayoutsScript.tsx` or a new `IkhlasScript.tsx` following the same `useLocale()` + `useEffect` pattern as TODO6
- Relevant for hotel-booking too (halal-friendly accommodation)
