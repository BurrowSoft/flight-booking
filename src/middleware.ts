import { type NextRequest, NextResponse } from "next/server";

const VALID_LOCALES = ["en","th","es","ru","pt-BR","fr","ja","zh","zh-TW","ar","de","id","ko","it","vi"] as const;
type Locale = (typeof VALID_LOCALES)[number];

// Maps locale code → ISO country code for detectCountry() spoofing
const LOCALE_TO_COUNTRY: Record<string, string> = {
  th: "TH", es: "ES", ru: "RU", "pt-BR": "BR", fr: "FR",
  ja: "JP", zh: "CN", "zh-TW": "TW", ar: "SA", de: "DE",
  id: "ID", ko: "KR", it: "IT", vi: "VN", en: "US",
};

const COUNTRY_LOCALE: Record<string, string> = {
  TH: "th",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  UY: "es", PY: "es", BO: "es", EC: "es", CR: "es", PA: "es", DO: "es",
  GT: "es", HN: "es", SV: "es", NI: "es", CU: "es",
  BR: "pt-BR", PT: "pt-BR",
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", LU: "fr", MC: "fr",
  JP: "ja",
  CN: "zh",
  TW: "zh-TW", HK: "zh-TW", MO: "zh-TW",
  SA: "ar", AE: "ar", EG: "ar", KW: "ar", QA: "ar",
  BH: "ar", OM: "ar", JO: "ar", LB: "ar", MA: "ar",
  DZ: "ar", TN: "ar", LY: "ar", IQ: "ar", SY: "ar", YE: "ar",
  DE: "de", AT: "de",
  ID: "id",
  KR: "ko",
  IT: "it",
  VN: "vi",
  RU: "ru", UA: "ru", KZ: "ru", BY: "ru",
};

export function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Dev mode: ?dev=1&country=th overrides locale + spoofs country header
  if (searchParams.get("dev") === "1") {
    const devLocale = searchParams.get("country") as string;
    if (devLocale && (VALID_LOCALES as readonly string[]).includes(devLocale)) {
      const devCountry = LOCALE_TO_COUNTRY[devLocale] ?? "US";
      const reqHeaders = new Headers(req.headers);
      reqHeaders.set("x-vercel-ip-country", devCountry);

      const res = NextResponse.next({ request: { headers: reqHeaders } });
      res.cookies.set("NEXT_LOCALE", devLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
      return res;
    }
  }

  // Normal flow: cookie already set — pass through
  if (req.cookies.has("NEXT_LOCALE")) return NextResponse.next();

  // First visit: detect country and seed cookie
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    "US";
  const locale = COUNTRY_LOCALE[country] ?? "en";

  const res = NextResponse.next();
  res.cookies.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|.*\\..*).*)"],
};