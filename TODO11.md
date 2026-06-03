# TODO11: Flight — 3 bug fixes

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports11.md (root burrowsoft-web-apps/Reports11.md) when done.

---

## Fix 1 — Kiwi widget shows wrong origin city

File: `src/components/FlightResultsView.tsx`

**Bug:** `from_name: from.toLowerCase()` sends `jfk` — Kiwi can't resolve lowercase and
falls back to the user's geolocation (Bangkok). Kiwi expects uppercase IATA codes.

**Fix:** one character change:
```ts
// BEFORE:
from_name: from.toLowerCase(),

// AFTER:
from_name: from,
```

`from` is already uppercase (e.g. "JFK", "BKK") — never lowercase it.

---

## Fix 2 — Airline logos not showing in Other Results

File: `src/lib/search.ts` — function `mapSharedFlight`

**Bug:** `logo: AIRLINE_LOGOS[airlineCode] ?? "✈️"` ignores `f.airlineLogo` which
contains a real CDN URL from the Flights Scraper Sky API (Skyscanner logos).

**Fix:** use the provider's logo URL if available, fall back to the emoji map:
```ts
logo: f.airlineLogo ?? AIRLINE_LOGOS[airlineCode] ?? "✈️",
```

`f.airlineLogo` is typed as `string | undefined` on the shared `Flight` type.
This one-line change makes real airline logos appear instead of the ✈️ fallback.

---

## Fix 3 — Trip.com appears for non-Asian routes

**Already fixed in shared.** The `buildFlightAffiliateLinks` utility in
`packages/shared/src/affiliates/flights.ts` has been updated to use destination-based
filtering (`showFor` function using `ASIAN_AIRPORTS` set) instead of visitor country.

JFK→LHR will show **Expedia only**.
BKK→HKT will show **Trip.com + Expedia**.

No code change needed in the app — just commit the updated shared file.

---

## Commit and push

```bash
git add -A
git commit -m "fix: Kiwi origin city, airline logos, Trip.com Asian-route filter"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```
