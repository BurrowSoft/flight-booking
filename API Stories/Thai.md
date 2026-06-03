# FlyMole — Thailand / SEA API Integration

> **START HERE** — flights is the first app to work on Thai API Stories.

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

---

## Nok Air deep-link CTA (no affiliate needed)
No affiliate program required — just a redirect button in flight results.

When origin or destination is a Thai airport (BKK, DMK, HKT, CNX, USM, HDY, KBV):
```ts
{
  name: "Nok Air",
  buildUrl: (params) =>
    `https://www.nokair.com/en/flight/search?from=${params.origin}&to=${params.destination}&departDate=${params.departureDate}&adult=${params.passengers}&type=OW`,
}
```

Add alongside the AirAsia CTA in the Thai airport affiliate link block. No tracking params needed.

---

## Full Thai airline CTA button set

Implement all of these as "Book on X ↗" buttons shown in flight results when country is TH or locale is `th`. All are plain deep-links except where affiliate is noted.

### Thai Airways (TG) — no affiliate, deep-link only
```ts
{
  name: "Thai Airways",
  commission: false,
  buildUrl: (params) =>
    `https://www.thaiairways.com/en_TH/book/search-flights.page?origin=${params.origin}&destination=${params.destination}&departDate=${params.departureDate}&adult=${params.passengers}&tripType=OW`,
}
```
> ⚠️ Verify exact query param names against thaiairways.com booking form — they may use POST. If params don't work, link to `https://www.thaiairways.com/en_TH/book/search-flights.page` without params.

### Bangkok Airways (PG) — no affiliate, deep-link only
```ts
{
  name: "Bangkok Airways",
  commission: false,
  buildUrl: (params) =>
    `https://booking.bangkokair.com/select?origin=${params.origin}&destination=${params.destination}&departDate=${params.departureDate.replace(/-/g, "")}&adults=${params.passengers}&tripType=OW`,
}
```
> ⚠️ Verify date format (YYYYMMDD vs YYYY-MM-DD) against their booking engine. Bangkok Airways is important for unique routes: Koh Samui (USM), Sukhothai (THS), Trat (TDX).

### Thai Lion Air (SL) — no affiliate, deep-link only
```ts
{
  name: "Thai Lion Air",
  commission: false,
  buildUrl: (params) =>
    `https://www.lionairthai.com/en/Booking-Detail?From=${params.origin}&To=${params.destination}&DepartDate=${params.departureDate}&Adult=${params.passengers}&TripType=OW`,
}
```
> ⚠️ Verify param names — Lion Air Thai booking page may differ. Fallback: link to `https://www.lionairthai.com`.

### Thai Vietjet (VZ) — ✅ affiliate available (Shopnomix / Yeesshh)
```ts
{
  name: "Thai Vietjet",
  commission: true, // after signing up with Shopnomix or Yeesshh
  buildUrl: (params) =>
    `https://www.thaivietair.com/en-us/#/booking?departureCity=${params.origin}&arrivalCity=${params.destination}&departureDate=${params.departureDate}&passengerAdult=${params.passengers}&tripType=ow`,
}
```
**Affiliate setup:**
- Sign up at https://www.shopnomix.com or https://www.yeesshh.com as a publisher
- Get Thai Vietjet affiliate link — append tracking params to the URL above
- New env var: `NEXT_PUBLIC_THAIVIETJET_AFFILIATE_ID`

### Scoot (TR) — no affiliate, deep-link only
```ts
{
  name: "Scoot",
  commission: false,
  buildUrl: (params) =>
    `https://www.flyscoot.com/en/plan-a-trip/search-results?trip-type=ow&from=${params.origin}&to=${params.destination}&depart=${params.departureDate}&pax-adult=${params.passengers}`,
}
```
> Scoot is Singapore-based but has heavy BKK/DMK routes. Relevant when destination is SIN, or origin is a Thai airport.

---

## Commission summary for Thai flights

| Airline | Commission | How |
|---|---|---|
| AirAsia | ✅ Yes | AirAsia affiliate program (pending) |
| Thai Vietjet | ✅ Yes | Shopnomix or Yeesshh (pending signup) |
| Ikhlas Travel | ✅ Yes | Same portal as AirAsia (pending approval) |
| Nok Air | ❌ No | Plain deep-link only |
| Thai Airways | ❌ No | No affiliate program |
| Bangkok Airways | ❌ No | No affiliate program (could email partnerservice@bangkokair.com) |
| Thai Lion Air | ❌ No | No formal affiliate |
| Scoot | ❌ No | No affiliate program |
| Travelpayouts | ✅ Yes | Covers many of the above via meta-search |

> **Note:** Travelpayouts API may already surface fares from Thai Airways, Nok Air, Vietjet etc — confirm coverage at https://support.travelpayouts.com before building individual CTAs for those airlines.
