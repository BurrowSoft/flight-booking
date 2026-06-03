# TODO_X: SEO — Google Crawlability & Structured Data

## App: flight-booking (https://www.flymole.com)

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Do NOT fill a Reports file for this TODO. Just commit and push when done.

## Overview
Three SEO tasks. Do all three. Do NOT change any existing functionality, API routes, or UI.

---

## Task 1 — WebSite JSON-LD in layout.tsx

Add a `<script type="application/ld+json">` tag inside the `<body>` of`src/app/layout.tsx`.

`	sx
const WEBSITE_SCHEMA = { /* see App-specific section below */ };

// Inside the layout return, inside <body>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
/>
`"

---

## Task 2 — hreflang alternate links

Add to the root `metadata` export in `src/app/layout.tsx`:

`	s
alternates: {
  languages: {
    "en": "https://www.flymole.com",
    "th": "https://www.flymole.com",
    "es": "https://www.flymole.com",
    "ru": "https://www.flymole.com",
    "pt-BR": "https://www.flymole.com",
    "fr": "https://www.flymole.com",
    "ja": "https://www.flymole.com",
    "zh": "https://www.flymole.com",
    "zh-TW": "https://www.flymole.com",
    "ar": "https://www.flymole.com",
    "de": "https://www.flymole.com",
    "id": "https://www.flymole.com",
    "ko": "https://www.flymole.com",
    "it": "https://www.flymole.com",
    "vi": "https://www.flymole.com",
    "x-default": "https://www.flymole.com",
  },
},
`"

---

## Task 3 — robots.ts audit

See App-specific section for exact disallow rules.

---

## App-specific: flight-booking

### WebSite schema for Task 1

```ts
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FlyMole",
  "url": "https://www.flymole.com",
  "description": "Compare and book cheap flights from hundreds of airlines worldwide.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.flymole.com/search?from={origin_airport}&to={destination_airport}&date={departure_date}"
    },
    "query-input": [
      "required name=origin_airport",
      "required name=destination_airport",
      "required name=departure_date"
    ]
  }
};
```

### BreadcrumbList on flight route pages

In `src/app/flights/[slug]/page.tsx` (if it exists), add BreadcrumbList JSON-LD:

```ts
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.flymole.com" },
    { "@type": "ListItem", "position": 2, "name": "Flights", "item": "https://www.flymole.com/flights" },
    { "@type": "ListItem", "position": 3, "name": `${originCity} to ${destinationCity}` }
  ]
};
```

Add as a `<script type="application/ld+json">` in the page's JSX, similar to Task 1.

### robots.ts

Disallow list should be: `["/api/", "/_next/", "/search"]`
The `/flights/` static pages should remain ALLOWED — those are indexable.

---

## Commit and push

```bash
git add -A
git commit -m "seo: JSON-LD structured data, hreflang, robots.txt"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```