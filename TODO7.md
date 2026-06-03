# TODO7: Add All Supported Locales (15 languages)

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports7.md (root burrowsoft-web-apps/Reports7.md) when done.

## Overview
Expand i18n from 2 locales (en, th) to 15:
`en, th, es, ru, pt-BR, fr, ja, zh, zh-TW, ar, de, id, ko, it, vi`

The shared `LanguageSelector` already has all locale names. The work here is:
1. Generate translation files for each new locale
2. Update i18n config to recognise all locales
3. Update middleware country→locale mapping
4. Update layout LanguageSelector to list all locales
5. Add font + RTL support for non-Latin scripts

---

## 1. Generate translation files

For each new locale, create `src/messages/{locale}.json` by translating `src/messages/en.json`.
Use your own translation capability — do not leave strings in English.

Locales to create (en and th already exist):
`es, ru, pt-BR, fr, ja, zh, zh-TW, ar, de, id, ko, it, vi`

Rules:
- Brand names stay as-is: app name (FlyMole, BookingMole, etc.), "BurrowSoft", provider names (Booking.com, Lazada, etc.)
- All other strings must be translated
- Keep all interpolation placeholders exactly as-is: `{count}`, `{provider}`, `{time}`, etc.
- Arabic (`ar`): translate right-to-left, but the JSON keys stay in English
- pt-BR filename: `pt-BR.json` (hyphen, not underscore)

---

## 2. Update i18n config

Find the file that defines supported locales (usually `src/i18n.ts` or `src/i18n/request.ts`).
Extend the `LOCALES` / `SUPPORTED` / `locales` array to include all 15:

```ts
const LOCALES = ["en","th","es","ru","pt-BR","fr","ja","zh","zh-TW","ar","de","id","ko","it","vi"] as const;
```

The `getRequestConfig` function loads messages — make sure it handles all new locales without crashing on unknown values.

---

## 3. Update middleware country→locale mapping

Find `src/middleware.ts`. Extend the country→locale detection:

```ts
const COUNTRY_LOCALE: Record<string, string> = {
  TH: "th",
  // Spanish-speaking
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  // Portuguese
  BR: "pt-BR", PT: "pt-BR",
  // French
  FR: "fr", BE: "fr", CH: "fr", CA: "fr",
  // Japanese
  JP: "ja",
  // Chinese Simplified
  CN: "zh",
  // Chinese Traditional
  TW: "zh-TW", HK: "zh-TW", MO: "zh-TW",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar", MA: "ar",
  // German
  DE: "de", AT: "de",
  // Indonesian
  ID: "id",
  // Korean
  KR: "ko",
  // Italian
  IT: "it",
  // Vietnamese
  VN: "vi",
  // Russian
  RU: "ru", UA: "ru", KZ: "ru", BY: "ru",
};
```

Keep `en` as the fallback for any country not in the map.

---

## 4. Update LanguageSelector in layout

In `src/app/layout.tsx`, update the `locales` prop:

```tsx
<LanguageSelector
  locales={["en","th","es","ru","pt-BR","fr","ja","zh","zh-TW","ar","de","id","ko","it","vi"]}
/>
```

If MobileNav also renders LanguageSelector, update it there too.

---

## 5. Font support for non-Latin scripts

The current Sarabun font only covers Thai + Latin. Add script-specific fonts:

```tsx
import { Sarabun, Noto_Sans_JP, Noto_Sans_SC, Noto_Sans_TC, Noto_Sans_KR, Noto_Sans_Arabic } from "next/font/google";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400","600","700"], variable: "--font-sarabun", display: "swap" });
const notoJP  = Noto_Sans_JP({ subsets: ["japanese"], weight: ["400","700"], variable: "--font-noto-jp", display: "swap" });
const notoSC  = Noto_Sans_SC({ subsets: ["chinese-simplified"], weight: ["400","700"], variable: "--font-noto-sc", display: "swap" });
const notoTC  = Noto_Sans_TC({ subsets: ["chinese-traditional"], weight: ["400","700"], variable: "--font-noto-tc", display: "swap" });
const notoKR  = Noto_Sans_KR({ subsets: ["korean"], weight: ["400","700"], variable: "--font-noto-kr", display: "swap" });
const notoAR  = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400","700"], variable: "--font-noto-ar", display: "swap" });
```

Apply CSS variables to `<html>` and use Tailwind to activate the right font per locale:

```tsx
// In layout.tsx body/html className:
const fontClass = {
  ja: notoJP.variable,
  zh: notoSC.variable,
  "zh-TW": notoTC.variable,
  ko: notoKR.variable,
  ar: notoAR.variable,
  th: sarabun.variable,
}[locale] ?? "";
```

---

## 6. RTL support for Arabic

When locale is `ar`, set `dir="rtl"` on `<html>`:

```tsx
<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
```

---

## 7. Verify

Spot-check these locales manually:
- `ar` — text is RTL, font renders correctly, no English strings visible
- `zh` — Simplified Chinese, no Traditional characters
- `ja` — Japanese font renders correctly
- `ru` — Cyrillic renders (system fonts cover this, no special font needed)
- `pt-BR` — Brazilian Portuguese, not European Portuguese

## Commit and push