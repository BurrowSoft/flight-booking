# FlyMole — API Integration TODO

IMPORTANT: PLEASE KEEP UPDATING YOUR SECTION IN ../Reports.md with
- status
- pending decisions
- pending actions
- concerns
- suggestions

## Permissions
Before starting work, ask the user to enable bypass permissions so you don't get approval prompts on every file operation. They can do this by opening Claude Code settings and setting permission mode to "bypass", or by launching with `claude --dangerously-skip-permissions`.

## Available API Keys (already set on Vercel)
- `RAPIDAPI_KEY` — booking-com15 (flights endpoint)
- `SKYSCANNER_RAPIDAPI_KEY` — Skyscanner via RapidAPI
- `OPENAI_API_KEY` — AI summaries

## ⚠️ Vercel Env Var Discrepancy
Vercel has both `RAPIDAPI_KEY` (Production only) and `RAPID_API_KEY` (Production + Preview). The codebase uses `RAPIDAPI_KEY`. Confirm which is correct and remove the duplicate from Vercel.

## Architecture: Client-Driven Fetching
All search calls must go through a Next.js API route (`/api/flights`) rather than directly in server components. This enables the client to drive the loading overlay and show per-provider progress in real time.

Pattern:
1. User submits search → client calls `/api/flights?...`
2. API route fans out to all providers concurrently via `ProviderRouter`
3. Client shows the loading overlay while awaiting the response
4. Results return as JSON; client renders them and dismisses the overlay

Wrap every provider call inside the API route with `unstable_cache` from `next/cache` (TTL: 5 min / `revalidate: 300`). Cache key = all search params stringified. Repeated identical searches within 5 minutes return cached data without burning RapidAPI quota.

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

### 3. Remove Amadeus, add Kiwi Tequila as replacement
Amadeus self-service is decommissioned — delete these files entirely:
- `packages/shared/src/providers/flights/amadeus.ts`
- Remove its registration from `packages/shared/src/providers/flights/index.ts`

Then create `packages/shared/src/providers/flights/kiwi.ts`:
- Kiwi Tequila API base: `https://api.tequila.kiwi.com`
- Requires new env var: `KIWI_API_KEY` — add to Vercel and `.env.example`
- Implement `search()` returning normalized `Flight[]`
- Register in `packages/shared/src/providers/flights/index.ts`

### 4. Price comparison UI
File: `src/app/search/` or equivalent results page
- Show each result's source provider badge (Skyscanner / Booking.com / Kiwi)
- If the same flight appears from multiple providers at different prices, group and show the cheapest with a "X providers" indicator

### 5. Loading overlay — show while APIs are fetching
The search results page must show a full-screen (or above-the-fold) loading overlay while provider calls are in flight. Requirements:
- Each active provider fetches concurrently; the overlay displays one animated line per provider, e.g. "Loading flights from Skyscanner…" / "Loading flights from Booking.com…" / "Loading flights from Kiwi…"
- As each provider resolves, its line gets a checkmark and its results stream into the list below
- If a provider fails or times out, its line shows "Skyscanner unavailable" in muted text — no hard error
- Implement as a client component (`<FlightLoadingOverlay providers={string[]} />`) that receives the list of provider names being polled
- The overlay fades out once all providers have settled

### 6. Provider redirect buttons
Every flight result card must have a clearly labelled booking button that sends the user directly to that provider's booking page with the deal pre-filled. Requirements:
- Button label: "Book on [Provider]" (e.g. "Book on Skyscanner", "Book on Booking.com")
- Each provider class must expose a `bookingUrl(flight: Flight): string` method returning the deep-link URL with origin, destination, dates, and passenger count pre-filled
- If a flight appears from multiple providers, show multiple buttons (cheapest highlighted)
- Buttons open in a new tab (`target="_blank" rel="noopener noreferrer"`)
- Affiliate tracking params must be appended where applicable (Skyscanner affiliate ID, Travelpayouts marker, etc.)

### 7. Price staleness — auto-refresh after 5 minutes
Flight prices change fast. Requirements:
- Client tracks the timestamp when results were last loaded
- After 5 minutes on the results page, silently re-call `/api/flights` with the same params
- While refreshing, show the loading overlay with the message "Fetching up-to-date prices…" (same overlay component, reused)
- When fresh results arrive, update the list in place — no hard refresh, no scroll reset
- If the refresh fails, dismiss the overlay silently and show a small toast: "Prices could not be refreshed — last updated at HH:MM"
- Always show a "Prices as of HH:MM" timestamp below the results header

### 8. Themed mascot — FlyMole
Create `public/mascot.svg` — the base BurrowSoft Mole (glasses, peeking over ledge, black line-art style) with a tiny airplane added beneath the ledge it's peeking over. The airplane should be in the same stroke style as the mole. SVG must have `<g id="mole-base">` and `<g id="prop">` groups. ViewBox: `0 0 200 200`.

### 9. App thumbnail / OG image
- `public/og-image.png` — 1200×630px, FlyMole mascot centred on brand background colour, "FlyMole" wordmark below
- `public/favicon.ico` — mole head only, 32×32 and 16×16
- `public/apple-touch-icon.png` — 180×180px, mole head on brand background
- Wire all into `src/app/layout.tsx` metadata (`icons`, `openGraph.images`)

### 10. Footer — BurrowSoft branding
Add to the existing footer:
- Small BurrowSoft logo (mole + wordmark) linking to burrowsoft.com
- Links to sibling products: BookingMole, InsightMole, RentACarMole, GamesMole, ShoppingMole
- Copyright: "© 2025 BurrowSoft. All rights reserved."
Logo assets are in `public/` — copy `burrowsoft-logo.svg` from the main-website repo.

### 11. Sync shared to all apps after any provider changes
After editing any file in `packages/shared/src/`, copy the entire `packages/shared/` folder to the same path in: hotel-booking, news-feed, rent-a-car, main-website, games, shopping.
