# FlyMole — API Integration TODO

## Permissions
Before starting work, ask the user to enable bypass permissions so you don't get approval prompts on every file operation. They can do this by opening Claude Code settings and setting permission mode to "bypass", or by launching with `claude --dangerously-skip-permissions`.

## Available API Keys (already set on Vercel)
- `RAPIDAPI_KEY` — booking-com15 (flights endpoint)
- `SKYSCANNER_RAPIDAPI_KEY` — Skyscanner via RapidAPI
- `OPENAI_API_KEY` — AI summaries

## ⚠️ Urgent: Amadeus Decommission
Amadeus self-service API is being shut down July 2026. The `AmadeusFlightProvider` in `packages/shared/src/providers/flights/` must be replaced. Recommended replacement: **Kiwi.com Tequila API** or **Travelpayouts Flight Data API**.

## ⚠️ Vercel Env Var Discrepancy
Vercel has both `RAPIDAPI_KEY` (Production only) and `RAPID_API_KEY` (Production + Preview). The codebase uses `RAPIDAPI_KEY`. Confirm which is correct and remove the duplicate from Vercel.

## Tasks

### 1. Skyscanner Provider — enrich results
File: `packages/shared/src/providers/flights/skyscanner.ts`
- Wire flight leg details: departure/arrival times, stops, duration, carrier codes
- Map carrier IATA codes to airline names (use a static map or Skyscanner's carriers endpoint)
- Include airline logo URLs (Skyscanner provides logo URLs in the carriers response)
- Normalize layover airports into the `Flight` DTO

### 2. Booking.com Flights Provider — fully wire
File: `packages/shared/src/providers/flights/bookingcom.ts`
RapidAPI host: `booking-com15.p.rapidapi.com`
Relevant endpoints (fetch docs from RapidAPI if needed):
- `GET /api/v1/flights/searchFlights` — main search
- `GET /api/v1/flights/getFlightDetails` — per-flight detail
Tasks:
- Return real prices, airline names, logos, stop counts, baggage info
- Normalize to `Flight` DTO from `@burrowsoft/shared`

### 3. Replace Amadeus with Kiwi Tequila
File: create `packages/shared/src/providers/flights/kiwi.ts`
Kiwi Tequila API base: `https://api.tequila.kiwi.com`
- Requires new env var: `KIWI_API_KEY` — add to Vercel and `.env.example`
- Implement `search()` returning normalized `Flight[]`
- Register in `packages/shared/src/providers/flights/index.ts` replacing Amadeus

### 4. Price comparison UI
File: `src/app/search/` or equivalent results page
- Show each result's source provider badge (Skyscanner / Booking.com / Kiwi)
- If the same flight appears from multiple providers at different prices, group and show the cheapest with a "X providers" indicator

### 5. Sync shared to all apps after any provider changes
After editing any file in `packages/shared/src/`, copy the entire `packages/shared/` folder to the same path in: hotel-booking, news-feed, rent-a-car, main-website, games, shopping.
