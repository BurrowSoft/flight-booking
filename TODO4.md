# FlyMole — TODO4: Complete Thai/Portuguese Localisation

Finish translation coverage and adopt the shared `LanguageSelector` dropdown component.

## Replace LanguageSelector with shared component
Delete `src/components/LanguageSelector.tsx`. In `layout.tsx`:
```tsx
import { LanguageSelector } from "@burrowsoft/shared";
<LanguageSelector locales={["en", "th"]} />
```

## Wire FlightSearchForm strings
Add `useTranslations("search")` and replace hardcoded strings with `t()` calls:
- `"From"`, `"To"`, `"Departure"`, `"Return (optional)"`, `"Passengers"`, `"Search Flights"`, `"One way"`, `"Round trip"`

## Translate page-level hero (if pending)
- `page.tsx` hero title/subtitle/CTA
- Destination detail pages (`/flights/[origin]/[destination]`) — headers, SEO content

## Verify loading overlay labels
Check `FlightLoadingOverlay.tsx` provider names use `source.name` field (Kiwi, Skyscanner, Booking.com, Travelpayouts).

## Test end-to-end
1. Load page in EN
2. Switch locale dropdown to TH — verify Thai render + Sarabun font
3. Switch back to EN — verify English + font reverts
4. Reload page — verify cookie persists

## Fill in ThaiReports.md
Document translation coverage. Link to `API Stories/Thai.md` for later API work (Travelpayouts, AirAsia, etc.).

---

**API work:** See `API Stories/Thai.md` and `API Stories/Brazil.md` (start after localisation is complete).
