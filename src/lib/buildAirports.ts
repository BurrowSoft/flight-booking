import type { Airport } from "./types";
import rawAirports from "airports";

const CONTINENT: Record<string, string> = {
  AF: "Africa", AN: "Antarctica", AS: "Asia",
  EU: "Europe", NA: "North America", OC: "Oceania", SA: "South America",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(iso: string): string {
  if (!iso) return "";
  try { return regionNames.of(iso) ?? iso; } catch { return iso; }
}

function extractCity(name: string): string {
  if (!name) return "";
  return (
    name
      .replace(/\s*[–—-]\s*.+$/, "")
      .replace(/\s+(international\s+)?airport.*$/i, "")
      .replace(/\s+int['']?l\.?\s*$/i, "")
      .replace(/\s+(airfield|aerodrome|airstrip|air\s+base|heliport|airpark)\b.*$/i, "")
      .trim() || name
  );
}

const CITY_OVERRIDES: Record<string, string> = {
  JFK: "New York", LGA: "New York", EWR: "Newark",
  LHR: "London", LGW: "London", STN: "London", LTN: "London", LCY: "London",
  ORD: "Chicago", MDW: "Chicago",
  CDG: "Paris", ORY: "Paris",
  NRT: "Tokyo", HND: "Tokyo",
  PVG: "Shanghai", SHA: "Shanghai",
  PEK: "Beijing", PKX: "Beijing",
  SVO: "Moscow", DME: "Moscow", VKO: "Moscow",
  GRU: "São Paulo", CGH: "São Paulo",
  GIG: "Rio de Janeiro", SDU: "Rio de Janeiro",
  EZE: "Buenos Aires", AEP: "Buenos Aires",
  YYZ: "Toronto", YTZ: "Toronto",
  LAX: "Los Angeles", BUR: "Los Angeles",
  DXB: "Dubai", DWC: "Dubai",
  IST: "Istanbul", SAW: "Istanbul",
  KUL: "Kuala Lumpur", SZB: "Kuala Lumpur",
  BKK: "Bangkok", DMK: "Bangkok",
  ICN: "Seoul", GMP: "Seoul",
};

const SIZE_RANK: Record<string, number> = { large: 3, medium: 2, small: 1 };

export function buildAirports(): Record<string, Airport> {
  const airports: Record<string, Airport> = {};
  const ranks: Record<string, number> = {};

  for (const raw of rawAirports) {
    if (!raw.iata || !raw.name || raw.status !== 1) continue;

    const rank = SIZE_RANK[raw.size ?? "small"] ?? 0;
    if (ranks[raw.iata] !== undefined && rank <= (ranks[raw.iata] ?? 0)) continue;

    ranks[raw.iata] = rank;
    airports[raw.iata] = {
      code: raw.iata,
      name: raw.name,
      city: CITY_OVERRIDES[raw.iata] ?? extractCity(raw.name),
      country: countryName(raw.iso ?? ""),
      continent: CONTINENT[raw.continent ?? ""] ?? raw.continent ?? "",
    };
  }

  return airports;
}
