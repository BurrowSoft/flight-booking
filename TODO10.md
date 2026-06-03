# TODO10: Loading animations + Flights Scraper Sky API

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports10.md (root burrowsoft-web-apps/Reports10.md) when done.

## Two independent tasks. Do both.

---

## Task A — Loading animation for Kiwi widget

File: `src/components/FlightResultsView.tsx`

The Kiwi widget injects via script and takes 2–4s to render. Currently the container
is blank during that time → high bounce. Fix: show a skeleton until the widget renders.

### Implementation

Add state: `const [kiwiLoaded, setKiwiLoaded] = useState(false);`

Reset on every re-inject: inside the `useEffect` that injects the Kiwi script, add
`setKiwiLoaded(false)` at the top.

Use a MutationObserver to detect when the widget has injected content:

```ts
const observer = new MutationObserver(() => {
  if (container.children.length > 0) {
    setKiwiLoaded(true);
    observer.disconnect();
  }
});
observer.observe(container, { childList: true, subtree: true });
```

Disconnect the observer in the cleanup:
```ts
return () => {
  observer.disconnect();
  container.innerHTML = "";
};
```

In the JSX, show skeleton OVER the container while not loaded:

```tsx
{/* Kiwi container — always mounted so script can inject into it */}
<div className="relative">
  {!kiwiLoaded && mode === "kiwi" && (
    <div className="absolute inset-0 space-y-3 p-1 z-10 bg-white">
      {[1,2,3].map(i => (
        <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
      ))}
      <p className="text-center text-xs text-slate-400 pt-2">
        Searching flights via Kiwi...
      </p>
    </div>
  )}
  <div ref={containerRef} className="w-full min-h-[400px]" />
</div>
```

Also reset `kiwiLoaded` when mode changes back to "kiwi" after being on "other":
```ts
useEffect(() => {
  if (mode === "kiwi") setKiwiLoaded(false);
}, [mode]);
```

---

## Task B — Switch flight data to Flights Scraper Sky (Skyscanner)

The shared package now includes `FlightScraperSkyProvider` which uses
`flights-sky.p.rapidapi.com` — same `RAPIDAPI_KEY` already in Vercel.

`createFlightRouter()` now uses `FlightScraperSkyProvider` as primary provider.
Booking.com flights remains as fallback.

### What you need to do

**Step 1 — Verify the API response shape.**

The `/api/flights` route calls `createFlightRouter()` from `@burrowsoft/shared`.
Run the dev server and test:

```
GET /api/flights?from=JFK&to=LHR&date=2026-07-01&adults=1&cabin=economy&currency=USD&country=US
```

Check the response. If flights come back with valid prices and airlines, the provider
works as-is.

**Step 2 — If the response shape differs from what FlightResultsView expects:**

Look at `FlightResultsView.tsx` "other" mode — it maps `flight.airline.name`,
`flight.airline.logo`, `flight.durationMinutes`, `flight.departureTime`,
`flight.arrivalTime`, `flight.price`.

Cross-reference against what `/api/flights` actually returns and adjust the
rendering in `FlightResultsView.tsx` to match. Do NOT change the provider or
shared types — adjust the view only.

**Step 3 — Handle the incomplete status gracefully.**

The Flights Scraper Sky API sometimes returns partial results on first call
(status="incomplete"). The provider already handles one poll cycle with a 2s delay.
If results are still thin, the fallback to Booking.com provider kicks in automatically
via `ProviderRouter`.

If you see 0 results for a known busy route (e.g. JFK→LHR), check the Vercel
function logs for `[FlightScraperSky]` errors and report in Reports10.md.

**Step 4 — Test two routes:**
- JFK → LHR (transatlantic — good test of Skyscanner coverage)
- BKK → HKT (short-haul Asia — good test of Asian coverage)

Report results in Reports10.md.

---

## Commit and push

```bash
git add -A
git commit -m "feat: Kiwi loading skeleton + Flights Scraper Sky provider"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```
