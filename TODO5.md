# FlyMole — TODO5: Adopt Shared RegionalFloatingAd + Commit TODO4

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports5.md when done.

## Pending from TODO4 (uncommitted — verify then commit)
- `src/app/layout.tsx` — should import `LanguageSelector` from `@burrowsoft/shared`
- `src/components/FlightSearchForm.tsx` — search form strings wired to i18n
- `src/components/LanguageSelector.tsx` — DELETE this file (replaced by shared)
- `ThaiReports.md` — partially created, complete it

## Replace local LazadaFloatingAd with shared RegionalFloatingAd
Delete `src/components/LazadaFloatingAd.tsx`.

In `src/app/layout.tsx`:
```tsx
import { RegionalFloatingAd } from "@burrowsoft/shared";
// inside <body>:
<RegionalFloatingAd />
```

No props needed — reads locale internally. Only renders for locales in REGIONAL_ADS (currently `th`).

## Verify end-to-end
- EN: no floating ad shown
- TH: Lazada ad bottom-right, dismissible
- Language dropdown works

## Commit and push + fill Reports5.md