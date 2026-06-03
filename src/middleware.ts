import { type NextRequest, NextResponse } from "next/server";

const VALID_LOCALES = ["en","th","es","ru","pt-BR","fr","ja","zh","zh-TW","ar","de","id","ko","it","vi"] as const;

// locale → ISO country (for dev mode locale codes like ?dev=1&country=th)
const LOCALE_TO_COUNTRY: Record<string, string> = {
  th: "TH", es: "ES", ru: "RU", "pt-BR": "BR", fr: "FR",
  ja: "JP", zh: "CN", "zh-TW": "TW", ar: "SA", de: "DE",
  id: "ID", ko: "KR", it: "IT", vi: "VN", en: "US",
};

// ISO country → locale (for first-visit auto-detection + dev mode country codes)
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

function patchCookieLocale(req: NextRequest, locale: string): Headers {
  const reqHeaders = new Headers(req.headers);
  const existing = req.headers.get("cookie") ?? "";
  const filtered = existing.split(";").filter(c => !c.trim().startsWith("NEXT_LOCALE="));
  filtered.push(`NEXT_LOCALE=${locale}`);
  reqHeaders.set("cookie", filtered.join("; "));
  return reqHeaders;
}

export function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Dev mode: ?dev=1&country=XX — accepts locale codes (th, es, ja...)
  // OR ISO country codes (TH, FI, PL, GB, US...) for testing geo-gated widgets
  if (searchParams.get("dev") === "1") {
    const devParam = searchParams.get("country");
    if (devParam) {
      const isLocale = (VALID_LOCALES as readonly string[]).includes(devParam);
      const asCountryCode = devParam.toUpperCase();

      if (isLocale) {
        // e.g. ?dev=1&country=th → locale=th, geo=TH
        const devCountry = LOCALE_TO_COUNTRY[devParam] ?? "US";
        const reqHeaders = patchCookieLocale(req, devParam);
        reqHeaders.set("x-burrowsoft-geo", devCountry);
        const res = NextResponse.next({ request: { headers: reqHeaders } });
        res.cookies.set("NEXT_LOCALE", devParam, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
        return res;
      } else if (/^[A-Z]{2}$/.test(asCountryCode)) {
        // e.g. ?dev=1&country=FI → geo=FI, locale from COUNTRY_LOCALE (or "en")
        const devLocale = COUNTRY_LOCALE[asCountryCode] ?? "en";
        const reqHeaders = patchCookieLocale(req, devLocale);
        reqHeaders.set("x-burrowsoft-geo", asCountryCode);
        const res = NextResponse.next({ request: { headers: reqHeaders } });
        res.cookies.set("NEXT_LOCALE", devLocale, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
        return res;
      }
    }
  }

  if (req.cookies.has("NEXT_LOCALE")) return NextResponse.next();

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