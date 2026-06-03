# TODO12: Flight — 4 fixes

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports12.md (root burrowsoft-web-apps/Reports12.md) when done.

---

## Fix 1 — Currency not applied to flight results

**Problem:** `FlightResultsView` has `currency: string` in its Props interface but it is
missing from the function destructuring. The API call hardcodes `currency: "usd"`.
Thai users see USD prices instead of THB.

**Two-part fix:**

**Part A — `src/app/search/page.tsx`**

The search page already computes `currency` but doesn't pass it to `FlightResultsView`.
Add it:

```tsx
// Already computed in the page:
const currency = locale === "th" ? "THB" : getCurrencyForCountry(country);

// Add currency prop to FlightResultsView:
<FlightResultsView
  from={originCode}
  to={destinationCode}
  date={date}
  returnDate={returnDate}
  adults={adults}
  locale={locale}
  country={country}
  currency={currency}   // ← add this
/>
```

If `getCurrencyForCountry` is not already imported in search/page.tsx, import it:
```ts
import { detectCountry, getCurrencyForCountry } from "@burrowsoft/shared";
```

**Part B — `src/components/FlightResultsView.tsx`**

Add `currency` to the destructuring and use it in both fetch calls:

```tsx
export function FlightResultsView({ from, to, date, returnDate, adults, locale, country, currency }: Props) {
```

Replace the two hardcoded currency values:
```ts
// In the Kiwi widget params:
currency: currency.toLowerCase(),   // was: "usd"

// In the /api/flights fetch params:
currency: currency,                 // was: "USD"
```

---

## Fix 2 — Spinner on radio buttons instead of skeleton cards

**Problem:** The skeleton cards below the toggle are too aggressive. A small spinner
on the active button is clearer and less disruptive.

**File:** `src/components/FlightResultsView.tsx`

Add loading state flags:
- `kiwiLoading` — true while Kiwi widget is injecting (already tracked via MutationObserver)
- `otherLoading` — true while fetching from `/api/flights` (already tracked via `loading` state)

Replace skeleton cards with a spinner on the button:

```tsx
// The toggle buttons — add spinner to active one while loading:
{(["kiwi", "other"] as const).map(m => {
  const isActive = m === mode;
  const isLoading = (m === "kiwi" && !kiwiLoaded) || (m === "other" && loading);
  return (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors
        ${isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {isActive && isLoading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {m === "kiwi" ? "Kiwi Results" : "Other Results"}
    </button>
  );
})}
```

Remove the large skeleton pulse cards that were shown below the toggle for Kiwi.
Keep the 3-skeleton pulse divs for Other Results (those are inside the results area,
below the toggle, and only show while `loading` is true — that's fine to keep).

---

## Fix 3 — Trip.com secondary airport codes (e.g. DMK → BKK)

**Already fixed in shared.** `packages/shared/src/affiliates/flights.ts` now has
`TRIP_COM_CODE` mapping and `toTripComCode()` — secondary airports are mapped to
their city hub before building the URL.

JFK→DMK now builds `trip.com/flights/JFK-BKK/tickets-JFK-BKK` which resolves correctly.

No app-level code change needed — just commit the updated shared file.

---

## Fix 4 — Sort bar for Other Results

**Problem:** Hotels have a sort control but flights don't. Add client-side sorting
to the "Other Results" flight list.

**File:** `src/components/FlightResultsView.tsx`

Add sort state:
```ts
type SortKey = "price" | "duration" | "departure" | "stops";
const [sortBy, setSortBy] = useState<SortKey>("price");
```

Add a sort bar rendered above the flight cards (only when `flights.length > 0`):

```tsx
{!loading && flights.length > 0 && (
  <div className="flex items-center gap-2 mb-3 flex-wrap">
    <span className="text-xs text-slate-500 font-medium">Sort by:</span>
    {(["price", "duration", "departure", "stops"] as SortKey[]).map(key => (
      <button
        key={key}
        onClick={() => setSortBy(key)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
          ${sortBy === key
            ? "bg-sky-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
      >
        {key === "price" ? "Cheapest" :
         key === "duration" ? "Shortest" :
         key === "departure" ? "Earliest" :
         "Fewest stops"}
      </button>
    ))}
  </div>
)}
```

Sort the flights array before rendering:

```ts
const sortedFlights = [...flights].sort((a, b) => {
  switch (sortBy) {
    case "price":    return a.price.amount - b.price.amount;
    case "duration": return a.durationMinutes - b.durationMinutes;
    case "stops":    return a.stops - b.stops;
    case "departure":
      return a.departureTime.localeCompare(b.departureTime);
    default: return 0;
  }
});
```

Use `sortedFlights` instead of `flights` when rendering cards. Reset sort to
`"price"` whenever a new fetch completes (add `setSortBy("price")` after
`setFlights(data.flights ?? [])`).

---

## Commit and push

```bash
git add -A
git commit -m "fix: flight currency, spinner on tab, Trip.com codes, sort bar"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```
