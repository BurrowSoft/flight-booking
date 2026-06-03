# TODO9: Flights — "Other Results" shows real API flights with booking buttons

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports9.md (root burrowsoft-web-apps/Reports9.md) when done.

## Overview

The "Other Results" tab currently shows two generic cards (Trip.com, Expedia) with no
flight data. Replace this with real flights fetched from the existing `/api/flights`
endpoint. Each flight result shows times, airline, duration and price — plus
**Trip.com** and **Expedia** booking buttons pre-filled with that route + date.

The "Kiwi Results" tab is fine — do not touch it.

---

## Fix: FlightResultsView.tsx — "other" mode

File: `src/components/FlightResultsView.tsx`

### Step 1 — Fetch flights from the API in "other" mode

Add a fetch to `/api/flights` when mode switches to "other":

```ts
interface FlightResult {
  id: string;
  airline: string;
  airlineLogo?: string;
  departureTime: string;   // "09:15"
  arrivalTime: string;     // "12:30"
  duration: string;        // "3h 15m"
  stops: number;
  price: number;           // USD
  currency: string;
}
```

Add state:
```ts
const [flights, setFlights] = useState<FlightResult[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

Fetch in useEffect when mode === "other":
```ts
useEffect(() => {
  if (mode !== "other") return;
  setLoading(true);
  setError(null);

  const params = new URLSearchParams({
    from, to, date, adults: String(adults), cabin: "economy",
    ...(returnDate ? { return: returnDate } : {}),
  });

  fetch(`/api/flights?${params}`)
    .then(r => r.json())
    .then(data => {
      setFlights(data.flights ?? []);
      setLoading(false);
    })
    .catch(() => {
      setError("Could not load flights. Try the links below.");
      setLoading(false);
    });
}, [mode, from, to, date, returnDate, adults]);
```

### Step 2 — Check the existing `/api/flights` response shape

Look at `src/app/api/flights/route.ts` to confirm the response shape.
Adjust the `FlightResult` interface above to match what the API actually returns.
The key fields needed are: airline name, departure/arrival times, duration, stops, price.

### Step 3 — Render "other" mode content

Replace the current generic-card JSX in the "other" branch with:

```tsx
{/* Loading state */}
{loading && (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
    ))}
  </div>
)}

{/* Error fallback — still show the deep link cards */}
{!loading && error && (
  <p className="text-sm text-slate-500 mb-4">{error}</p>
)}

{/* Flight results */}
{!loading && flights.length > 0 && (
  <div className="space-y-3">
    {flights.map(flight => {
      const links = buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country });
      return (
        <div
          key={flight.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          {/* Flight info row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {flight.airlineLogo && (
                <img src={flight.airlineLogo} alt={flight.airline}
                  className="h-6 w-6 object-contain" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{flight.airline}</p>
                <p className="text-xs text-slate-400">
                  {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">
                {flight.departureTime} → {flight.arrivalTime}
              </p>
              <p className="text-xs text-slate-400">{flight.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-sky-600">
                ${flight.price}
              </p>
              <p className="text-xs text-slate-400">per person</p>
            </div>
          </div>

          {/* Booking buttons */}
          <div className="flex gap-2">
            {links.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-slate-200 py-2 text-center
                           text-xs font-semibold text-slate-700 hover:bg-slate-50
                           hover:border-sky-300 hover:text-sky-700 transition-colors"
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </div>
      );
    })}
  </div>
)}

{/* No results — fallback to plain deep links */}
{!loading && flights.length === 0 && (
  <div className="space-y-3">
    {buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country }).map(link => (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl border border-slate-200
                   bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
      >
        <div>
          <p className="font-semibold text-slate-900">{link.name}</p>
          <p className="text-sm text-slate-500 mt-0.5">{link.description}</p>
        </div>
        <span className="text-sky-600 text-sm font-medium">Search flights ↗</span>
      </a>
    ))}
  </div>
)}
```

### Step 4 — Verify `/api/flights` works

Check `src/app/api/flights/route.ts` exists and calls the RapidAPI flight provider.
If it was removed or broken, restore it from the existing `createFlightRouter` pattern
in `@burrowsoft/shared` — same pattern as the hotel API.

If the flight API returns no results for a route, the component falls back gracefully
to the plain deep-link cards (the "No results" branch above).

---

## What NOT to change

- "Kiwi Results" mode — do not touch
- The radio toggle — do not touch
- `/api/flights` route itself — only read from it, don't rewrite it
- Any other component or page

---

## Commit and push

```bash
git add -A
git commit -m "fix: flight Other Results — real API data with Trip.com/Expedia buttons"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```
