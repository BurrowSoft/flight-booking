import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const COUNTRY_LOCALE: Record<string, string> = {
  // Thai
  TH: "th",
  // Spanish-speaking
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  UY: "es", PY: "es", BO: "es", EC: "es", GT: "es", CU: "es", DO: "es",
  HN: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  // Portuguese (Brazilian)
  BR: "pt-BR", PT: "pt-BR",
  // French
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", LU: "fr", SN: "fr",
  CI: "fr", CM: "fr", ML: "fr", BF: "fr", TG: "fr", BJ: "fr",
  // Japanese
  JP: "ja",
  // Chinese Simplified
  CN: "zh",
  // Chinese Traditional
  TW: "zh-TW", HK: "zh-TW", MO: "zh-TW",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", KW: "ar", QA: "ar",
  BH: "ar", OM: "ar", JO: "ar", LB: "ar", MA: "ar",
  DZ: "ar", TN: "ar", LY: "ar", SD: "ar", IQ: "ar", SY: "ar", YE: "ar",
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
  RU: "ru", UA: "ru", KZ: "ru", BY: "ru", UZ: "ru",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only auto-set locale if no preference cookie exists yet
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      "";
    const locale = COUNTRY_LOCALE[country.toUpperCase()] ?? "en";
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
