# FlyMole — TODO3: Thai Localisation + Language Selector

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports3.md when done.

## Overview
When a user visits from Thailand (`x-vercel-ip-country: TH`), the app should default to Thai language. All users get a language selector (EN / TH) in the header.

## Architecture

### Approach: `next-intl` with cookie-based locale (no URL changes)
- Install `next-intl`
- Messages in `src/messages/en.json` and `src/messages/th.json`
- Locale stored in a `NEXT_LOCALE` cookie (set server-side on first visit via middleware, updatable client-side)
- No URL restructuring needed (`/search` stays `/search`, not `/th/search`)
- Server components use `getTranslations()`, client components use `useTranslations()`

### Locale detection logic
```
1. Read `NEXT_LOCALE` cookie → use it if present
2. Else: call detectCountry(headers) from @burrowsoft/shared
3. If country === "TH" → locale = "th", else locale = "en"
4. Set NEXT_LOCALE cookie for subsequent requests
```

## Tasks

### 1. Install and configure next-intl
```bash
npm install next-intl
```
- Create `src/i18n.ts` — request config that reads the `NEXT_LOCALE` cookie
- Create `src/middleware.ts` — sets `NEXT_LOCALE` cookie based on country detection if not already set
- Wrap root layout with `NextIntlClientProvider`

### 2. Create translation files

**`src/messages/en.json`**
```json
{
  "nav": { "home": "FlyMole", "search": "Search Flights" },
  "hero": {
    "title": "Compare Flights. No Tricks.",
    "subtitle": "Find the cheapest flights from top airlines and booking sites."
  },
  "search": {
    "from": "From",
    "to": "To",
    "departure": "Departure",
    "return": "Return (optional)",
    "passengers": "Passengers",
    "search": "Search Flights",
    "oneWay": "One way",
    "roundTrip": "Round trip"
  },
  "results": {
    "found": "{count} flights found",
    "noneFound": "No flights found for this search.",
    "pricesAsOf": "Prices as of {time}",
    "providers": "Found on {n} providers",
    "bookOn": "Book on {provider}",
    "stops": "{n} stop | {n} stops",
    "direct": "Direct",
    "loading": "Loading flights from {provider}…",
    "unavailable": "{provider} unavailable"
  },
  "footer": { "tagline": "Digging deep. Building solutions." }
}
```

**`src/messages/th.json`**
```json
{
  "nav": { "home": "FlyMole", "search": "ค้นหาเที่ยวบิน" },
  "hero": {
    "title": "เปรียบเทียบราคาบิน ไม่มีค่าธรรมเนียมซ่อน",
    "subtitle": "ค้นหาเที่ยวบินราคาถูกจากสายการบินและเว็บจองชั้นนำ"
  },
  "search": {
    "from": "จากเมือง",
    "to": "ไปเมือง",
    "departure": "วันเดินทาง",
    "return": "วันกลับ (ถ้ามี)",
    "passengers": "ผู้โดยสาร",
    "search": "ค้นหาเที่ยวบิน",
    "oneWay": "เที่ยวเดียว",
    "roundTrip": "ไป-กลับ"
  },
  "results": {
    "found": "พบ {count} เที่ยวบิน",
    "noneFound": "ไม่พบเที่ยวบินสำหรับการค้นหานี้",
    "pricesAsOf": "ราคา ณ เวลา {time}",
    "providers": "พบใน {n} แหล่ง",
    "bookOn": "จองที่ {provider}",
    "stops": "แวะ {n} ครั้ง",
    "direct": "บินตรง",
    "loading": "กำลังโหลดเที่ยวบินจาก {provider}…",
    "unavailable": "{provider} ไม่พร้อมใช้งาน"
  },
  "footer": { "tagline": "ค้นหาลึก สร้างสรรค์โซลูชัน" }
}
```

### 3. Language selector component
File: `src/components/LanguageSelector.tsx`
- Client component
- Renders a dropdown/toggle: 🇬🇧 EN / 🇹🇭 TH
- On change: sets `NEXT_LOCALE` cookie (max-age: 1 year) and calls `router.refresh()`
- Place in the site header, right side, next to any existing nav items
- Use Tailwind for styling — keep it compact (flag emoji + code)

### 4. Replace all hardcoded strings
Go through every component and replace hardcoded English strings with `t('key')` or `useTranslations('namespace')`. Priority files:
- `src/app/page.tsx` (hero section)
- `src/app/layout.tsx` (nav)
- `src/app/search/page.tsx` (search form)
- `src/components/FlightResults.tsx`
- `src/components/FlightCard.tsx`
- `src/components/FlightLoadingOverlay.tsx`

### 5. Thai font support
Add to `src/app/layout.tsx`:
```tsx
import { Sarabun } from "next/font/google";
const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "600", "700"] });
```
Apply conditionally based on locale, or add `thai` subset alongside Latin fonts.

### 6. Currency localisation
When locale is `th`, display prices in THB where possible (the `getCurrencyForCountry("TH")` function from `@burrowsoft/shared` returns `"THB"`). Prices from providers are in the provider's currency — show a note "prices shown in provider currency" if conversion isn't implemented.
