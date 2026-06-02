# FlyMole — Thai Localisation Report

## Translation Coverage (as of 2026-06-03)

| Area | Component | Status |
|---|---|---|
| Hero title / subtitle | `page.tsx` | ✅ Done |
| Nav links | `layout.tsx` | ✅ Done |
| Footer tagline + copyright | `layout.tsx` | ✅ Done |
| Search form — From / To / Departure / Return / One way / Round trip / Search Flights | `FlightSearchForm.tsx` | ✅ Done |
| Results — timestamps, empty state, refresh, loading overlay | `FlightResults.tsx`, `FlightLoadingOverlay.tsx` | ✅ Done |
| Flight card — Book on, Also on, Direct, stops, provider badge, Compare options | `FlightCard.tsx` | ✅ Done |
| Adults / Children / Cabin Class select labels | `FlightSearchForm.tsx` | ⏳ Pending — option values not translated |
| Destination route pages (`/flights/[route]`) | `flights/[route]/page.tsx` | ⏳ Pending |
| Booking modal strings | `BookingModal.tsx` | ⏳ Pending |
| Search error messages | `FlightSearchForm.tsx` | ⏳ Pending |

## Language Selector
- Shared `LanguageSelector` from `@burrowsoft/shared` — dropdown showing `English` / `ภาษาไทย`
- Sets `NEXT_LOCALE` cookie (1 year), triggers `router.refresh()` with `useTransition`
- Middleware auto-sets `th` on first visit from Thailand (`x-vercel-ip-country: TH`)

## Font
- **Sarabun** (Google Fonts) — Thai + Latin subsets, weights 400/600/700
- Applied via CSS variable when `locale === "th"`

## Currency
- Thai locale → THB passed to `CurrencyProvider` and all API calls
- Prices requested from providers in THB

## Thai-specific Features
- **Lazada floating ad** (`LazadaFloatingAd.tsx`) — shown only when `locale === "th"`, two affiliate links, dismissible per-item

## Affiliate Links (Thai market)
| Partner | Status | Notes |
|---|---|---|
| Lazada TH | ✅ Live | Two affiliate banners wired — `s.ZhTKMF` and `s.ZhTKLe` |
| Kiwi Tequila | ⏳ Pending | Affiliate agreement not yet signed — email `affiliates@kiwi.com` |
| Travelpayouts | ⏳ Pending | See `API Stories/Thai.md` |
| AirAsia | ⏳ Pending | See `API Stories/Thai.md` |

## See Also
- [`API Stories/Thai.md`](API%20Stories/Thai.md) — Thai-market API providers to integrate
- [`API Stories/Brazil.md`](API%20Stories/Brazil.md) — Brazil-market provider roadmap
