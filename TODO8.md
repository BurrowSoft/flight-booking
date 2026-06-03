# TODO8: Flight Results Page — Kiwi Widget + Affiliate Deep Links

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports8.md when done.

## Overview

Replace the current `/search` results view with a two-mode radio toggle:

```
[Your search form]  (already exists — FlightSearchForm, keep as-is)

  ◉ Kiwi Results   ○ Other Results

  [content area changes based on selection]
```

**Kiwi Results** — Travelpayouts/Kiwi search results widget, pre-populated with the user's search.
**Other Results** — Branded deep-link cards to Trip.com and Expedia, pre-filled with route + date + passengers.

AviaSales widget: do NOT implement. Dropped.

---

## 1. New component: `FlightResultsView`

Create `src/components/FlightResultsView.tsx` (client component).

Props:
```ts
interface Props {
  from: string;       // IATA origin e.g. "BKK"
  to: string;         // IATA destination e.g. "HKT"
  date: string;       // YYYY-MM-DD departure
  returnDate?: string; // YYYY-MM-DD return (undefined = one-way)
  adults: number;
  locale: string;     // next-intl locale e.g. "th", "en"
  country: string;    // ISO country code e.g. "TH" — for future country-gated partners
}
```

### 1a. Radio toggle

Two radio buttons at the top of the results area:
- `◉ Kiwi Results`
- `○ Other Results`

Default selected: `kiwi`.

Use Tailwind pill/tab style — no raw radio inputs. Example:
```tsx
<div className="flex gap-2 mb-6">
  {(["kiwi", "other"] as const).map(mode => (
    <button
      key={mode}
      onClick={() => setMode(mode)}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors
        ${mode === selected
          ? "bg-sky-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {mode === "kiwi" ? "Kiwi Results" : "Other Results"}
    </button>
  ))}
</div>
```

### 1b. Kiwi Results panel

Inject the Travelpayouts Kiwi Search Results Widget script dynamically.
Re-inject whenever any search param or locale changes.

Script base URL: `https://tpscr.com/content`

Fixed params (hardcoded):
```
trs=535682
shmarker=735444
powered_by=true
campaign_id=111
promo_id=4478
show_header=true
limit=3
primary_color=00AE98
results_background_color=FFFFFF
form_background_color=FFFFFF
currency=usd
```

Dynamic params (derived from props):
```
locale={widgetLocale}         // see WIDGET_LOCALE map below
from_name={from.toLowerCase()} // e.g. "bkk"
to_name={to}                   // e.g. "HKT"  
departure={date}               // YYYY-MM-DD
return={returnDate}            // YYYY-MM-DD — omit entirely if one-way
stops=0                        // always direct only for now
```

Locale map (app locale → widget locale):
```ts
const WIDGET_LOCALE: Record<string, string> = {
  en: "en", th: "th", es: "es", ru: "ru",
  "pt-BR": "pt", fr: "fr", ja: "ja", zh: "zh",
  "zh-TW": "zh", ar: "ar", de: "de", id: "id",
  ko: "ko", it: "it", vi: "vi",
};
```

Implementation pattern — same as CarRentalWidget in rent-a-car:
```tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (mode !== "kiwi") return;
  const container = containerRef.current;
  if (!container) return;
  container.innerHTML = "";

  const params = new URLSearchParams({
    trs: "535682", shmarker: "735444",
    powered_by: "true", campaign_id: "111", promo_id: "4478",
    show_header: "true", limit: "3", currency: "usd",
    primary_color: "00AE98", results_background_color: "FFFFFF",
    form_background_color: "FFFFFF",
    locale: WIDGET_LOCALE[locale] ?? "en",
    from_name: from.toLowerCase(),
    to_name: to,
    departure: date,
    stops: "0",
    ...(returnDate ? { return: returnDate } : {}),
  });

  const script = document.createElement("script");
  script.async = true;
  script.charset = "utf-8";
  script.src = `https://tpscr.com/content?${params}`;
  container.appendChild(script);

  return () => { container.innerHTML = ""; };
}, [mode, from, to, date, returnDate, locale]);

// In JSX:
<div ref={containerRef} className="w-full min-h-[400px]" />
```

### 1c. Other Results panel

Import `buildFlightAffiliateLinks` from `@burrowsoft/shared` — this utility is already prepared (see Section 3 below).

Display each affiliate as a card:
```tsx
const links = buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country });

<div className="grid gap-4">
  {links.map(link => (
    <a
      key={link.id}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-slate-200
                 bg-white px-6 py-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
    >
      <div>
        <div className="font-semibold text-slate-900">{link.name}</div>
        <div className="text-sm text-slate-500 mt-0.5">{link.description}</div>
      </div>
      <div className="flex items-center gap-2 text-sky-600 font-medium text-sm">
        Search flights
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  ))}
</div>
```

---

## 2. Wire into `/search` page

In `src/app/search/page.tsx`, replace the `<FlightResults>` section with `<FlightResultsView>`.

Pass the already-parsed props:
```tsx
import { FlightResultsView } from "@/components/FlightResultsView";

// In the JSX (after the compact FlightSearchForm):
<FlightResultsView
  from={originCode}
  to={destinationCode}
  date={date}
  returnDate={params.return}
  adults={adults}
  locale={locale}
  country={country}
/>
```

Remove `<FlightResults>` import and component if it only served to show API results — the new view replaces it.

---

## 3. Shared utility (already prepared — just import)

`@burrowsoft/shared` already exports `buildFlightAffiliateLinks`.

Function signature:
```ts
buildFlightAffiliateLinks(params: {
  from: string;        // IATA origin
  to: string;          // IATA destination  
  date: string;        // YYYY-MM-DD departure
  returnDate?: string; // YYYY-MM-DD return
  adults: number;
  country: string;     // ISO-3166-1 for country-gating
}): FlightAffiliateLink[]
```

Returns only the links visible to the user's country. Currently all links are worldwide (Trip.com + Expedia).
Future country-specific partners (e.g. Milhas for BR) just need adding to the affiliates config — no component changes needed.

---

## 4. Affiliate credentials (hardcoded in shared utility, DO NOT change)

**Trip.com:**
- AllianceId: `8495775`
- SID: `316966000`
- trip_sub3: `D17566096`

**Expedia:**
- clickref: `1011lDaf5v7r`
- affcid: `US.DIRECT.PHG.1011l432356.1101l81954`
- afflid: `1011lDaf5v7r`
- affdtl: `PHG.1011lDaf5v7r.PZ0lLz9DyY`

---

## 5. What NOT to build

- Do NOT re-implement API-based flight results (the old FlightResults component fetched from RapidAPI)
- Do NOT add AviaSales widget
- Do NOT add checkboxes — it's a radio toggle (only one view at a time)
- Do NOT add loading states for the deep-link cards (they're just links, instant)
- The Kiwi widget has its own loading indicator built-in

---

## 6. Commit and push

```bash
git add -A
git commit -m "feat: flight results — Kiwi widget + affiliate deep links toggle"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```
