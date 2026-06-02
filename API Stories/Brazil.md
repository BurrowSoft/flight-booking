# FlyMole — Brazil API Integration

> Work on this AFTER localisation (TODO4) is complete.

## What the user needs to arrange

| Service | Registration | Notes |
|---|---|---|
| **Travelpayouts** | https://www.travelpayouts.com/en/ | Same account as Thailand. Covers LATAM, Gol, Azul. No SEA-only gate — ensure it's enabled globally. |
| **LATAM Airlines API** | https://developers.latam-pass.latam.com | Official portal. Contact LATAM sales for partner access. Real-time fares for all LATAM Group routes. |
| **Decolar.com affiliate** | Contact Decolar partner team directly | No public API. Largest OTA in Brazil. Deep-link affiliate redirects only. |

No new env vars if Travelpayouts is already registered. For LATAM direct: `LATAM_API_KEY`.

## Tasks

### 1. Travelpayouts — remove SEA gate
`TravelpayoutsFlightProvider` from the Thailand task covers Brazilian routes (Gol, Azul, LATAM). Remove any SEA-only country gate — Travelpayouts is worldwide.

### 2. LATAMFlightProvider (when API access granted)
File: `packages/shared/src/providers/flights/latam.ts`
- Base URL: `https://portal.api.latampass.com` (verify in LATAM developer docs)
- Gate on `country === "BR"` or any LATAM country (`CL`, `AR`, `CO`, `PE`)

### 3. Decolar affiliate CTA
When `country === "BR"`, add Decolar to affiliate results CTA:
```
Name: Decolar.com
Description: Maior OTA da América Latina
URL: https://www.decolar.com/shop/flights/results/roundTrip/{origin}/{destination}/{date}/...
```

### 4. Brazilian airport priority in autocomplete
When country is `BR`:
- GRU (São Paulo Guarulhos), CGH (Congonhas), GIG (Rio Galeão), SDU (Santos Dumont), BSB (Brasília), SSA (Salvador), REC (Recife), FOR (Fortaleza), CNF (Belo Horizonte), MAO (Manaus), POA (Porto Alegre), CWB (Curitiba)
