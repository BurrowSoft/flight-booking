export interface CurrencyInfo {
  code: string;
  rate: number; // multiplier from USD
  locale: string;
}

// ISO 3166-1 alpha-2 → ISO 4217
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  US: "USD", CA: "CAD", MX: "MXN", CU: "CUP", JM: "JMD", PR: "USD",
  // South America
  BR: "BRL", AR: "ARS", CO: "COP", PE: "PEN", CL: "CLP", VE: "VES",
  UY: "UYU", PY: "PYG", BO: "BOB", EC: "USD",
  // Europe – Eurozone
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR", GR: "EUR", SK: "EUR",
  SI: "EUR", LV: "EUR", LT: "EUR", EE: "EUR", CY: "EUR", MT: "EUR",
  LU: "EUR", HR: "EUR",
  // Europe – non-Eurozone
  GB: "GBP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN", RS: "RSD", UA: "UAH",
  RU: "RUB", TR: "TRY", IS: "ISK", AL: "ALL", MK: "MKD", BA: "BAM",
  // Middle East
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR",
  JO: "JOD", IL: "ILS", LB: "LBP", IR: "IRR",
  // Asia – East
  JP: "JPY", CN: "CNY", KR: "KRW", HK: "HKD", TW: "TWD", MO: "MOP",
  MN: "MNT",
  // Asia – Southeast
  SG: "SGD", MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND",
  MM: "MMK", KH: "KHR", LA: "LAK", BN: "BND",
  // Asia – South
  IN: "INR", PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR", MV: "MVR",
  // Africa
  ZA: "ZAR", NG: "NGN", KE: "KES", EG: "EGP", MA: "MAD", TN: "TND",
  DZ: "DZD", GH: "GHS", ET: "ETB", TZ: "TZS", UG: "UGX", RW: "RWF",
  SN: "XOF", CI: "XOF", CM: "XAF", MU: "MUR", ZM: "ZMW", ZW: "ZWL",
  // Oceania
  AU: "AUD", NZ: "NZD", FJ: "FJD",
};

// Approximate exchange rates vs USD (updated periodically)
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  CNY: 7.24,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.89,
  SEK: 10.4,
  NOK: 10.5,
  DKK: 6.9,
  NZD: 1.63,
  SGD: 1.34,
  HKD: 7.82,
  KRW: 1320,
  INR: 83,
  BRL: 4.97,
  MXN: 17.2,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.307,
  BHD: 0.377,
  OMR: 0.385,
  JOD: 0.71,
  ILS: 3.7,
  TRY: 32.5,
  ZAR: 18.6,
  EGP: 48.5,
  MAD: 10.1,
  TND: 3.11,
  DZD: 135,
  NGN: 1550,
  KES: 129,
  GHS: 13.5,
  TWD: 31.6,
  THB: 35.8,
  MYR: 4.7,
  IDR: 15700,
  PHP: 56.5,
  VND: 24800,
  PKR: 278,
  BDT: 110,
  LKR: 325,
  NPR: 133,
  PLN: 3.97,
  CZK: 23.2,
  HUF: 356,
  RON: 4.6,
  BGN: 1.8,
  RUB: 92,
  UAH: 38.5,
  ARS: 870,
  COP: 3950,
  PEN: 3.72,
  CLP: 930,
  FJD: 2.24,
  MUR: 44.5,
};

// Map currency code → best locale for Intl.NumberFormat
const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", CNY: "zh-CN",
  AUD: "en-AU", CAD: "en-CA", CHF: "de-CH", SEK: "sv-SE", NOK: "nb-NO",
  DKK: "da-DK", NZD: "en-NZ", SGD: "en-SG", HKD: "zh-HK", KRW: "ko-KR",
  INR: "en-IN", BRL: "pt-BR", MXN: "es-MX", AED: "ar-AE", SAR: "ar-SA",
  QAR: "ar-QA", KWD: "ar-KW", ILS: "he-IL", TRY: "tr-TR", ZAR: "en-ZA",
  EGP: "ar-EG", MAD: "fr-MA", NGN: "en-NG", KES: "sw-KE", TWD: "zh-TW",
  THB: "th-TH", MYR: "ms-MY", IDR: "id-ID", PHP: "fil-PH", VND: "vi-VN",
  PKR: "ur-PK", BDT: "bn-BD", LKR: "si-LK", PLN: "pl-PL", CZK: "cs-CZ",
  HUF: "hu-HU", RON: "ro-RO", RUB: "ru-RU", ARS: "es-AR", COP: "es-CO",
  CLP: "es-CL", PEN: "es-PE",
};

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const code = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
  const rate = RATES[code] ?? 1;
  const locale = CURRENCY_LOCALE[code] ?? "en-US";
  return { code, rate, locale };
}

export function formatPrice(amountUsd: number, currency: CurrencyInfo): string {
  const converted = Math.round(amountUsd * currency.rate);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: currency.code === "JPY" || currency.code === "KRW" || currency.code === "IDR" || currency.code === "VND" ? 0 : 0,
    }).format(converted);
  } catch {
    return `${currency.code} ${converted.toLocaleString()}`;
  }
}
