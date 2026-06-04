import { AIRPORTS } from "./data";

// Main hub per country — fallback when city match fails
const COUNTRY_HUB: Record<string, string> = {
  TH: "BKK", US: "JFK", GB: "LHR", FR: "CDG", DE: "FRA",
  JP: "NRT", CN: "PEK", SG: "SIN", AU: "SYD", IN: "DEL",
  AE: "DXB", TR: "IST", KR: "ICN", MY: "KUL", ID: "CGK",
  HK: "HKG", TW: "TPE", VN: "SGN", PH: "MNL",
  BR: "GRU", AR: "EZE", MX: "MEX", CO: "BOG", CL: "SCL",
  PE: "LIM", CA: "YYZ", ZA: "JNB", EG: "CAI", NG: "LOS",
  PK: "KHI", BD: "DAC", LK: "CMB", NP: "KTM",
  RU: "SVO", UA: "KBP", PL: "WAW", NL: "AMS", BE: "BRU",
  CH: "ZRH", AT: "VIE", SE: "ARN", NO: "OSL", DK: "CPH",
  FI: "HEL", PT: "LIS", ES: "MAD", IT: "FCO", GR: "ATH",
  HU: "BUD", CZ: "PRG", RO: "OTP", IL: "TLV", SA: "RUH",
  QA: "DOH", KW: "KWI", NZ: "AKL",
};

export function detectOriginAirport(
  ipCity: string | null,
  ipCountry: string | null
): string {
  const city = decodeURIComponent(ipCity ?? "").toLowerCase().trim();
  const country = (ipCountry ?? "").toUpperCase();

  // 1. Exact city match on large airports
  if (city) {
    const match = Object.values(AIRPORTS).find(
      a => a.isPrimary && a.city.toLowerCase() === city
    );
    if (match) return match.code;

    // 2. Partial city match (e.g. "Greater Bangkok" → "Bangkok")
    const partial = Object.values(AIRPORTS).find(
      a => a.isPrimary && (city.includes(a.city.toLowerCase()) || a.city.toLowerCase().includes(city))
    );
    if (partial) return partial.code;
  }

  // 3. Country hub fallback
  if (country && COUNTRY_HUB[country]) return COUNTRY_HUB[country]!;

  // 4. First large airport in the country from dataset
  if (country) {
    const match = Object.values(AIRPORTS).find(
      a => a.isPrimary && a.isoCountry === country
    );
    if (match) return match.code;
  }

  return "";
}
