import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

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

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Dev override: ?dev=1&country=th — redirect to locale-prefixed URL for testing
  if (searchParams.get("dev") === "1") {
    const devParam = searchParams.get("country");
    if (devParam) {
      const locale = (routing.locales as readonly string[]).includes(devParam)
        ? devParam
        : COUNTRY_LOCALE[devParam.toUpperCase()] ?? "en";
      if (locale !== "en" && !pathname.startsWith(`/${locale}`)) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;
        return NextResponse.redirect(url);
      }
    }
  }

  // First-visit geo-redirect: no locale prefix + no prior cookie → redirect to locale URL
  const hasLocalePrefix = (routing.locales as readonly string[]).some(
    l => l !== "en" && (pathname.startsWith(`/${l}/`) || pathname === `/${l}`)
  );
  const isApiOrAsset = /^\/(api|_next|favicon|BingSiteAuth)/.test(pathname);
  const ua = req.headers.get("user-agent") ?? "";
  const isBot = /googlebot|bingbot|yandexbot|baiduspider|applebot|facebookexternalhit|twitterbot/i.test(ua);

  if (!hasLocalePrefix && !isApiOrAsset && !req.cookies.has("NEXT_LOCALE") && !isBot) {
    const country =
      req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ??
      "US";
    const locale = COUNTRY_LOCALE[country.toUpperCase()] ?? "en";
    if (locale !== "en") {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${pathname}`;
      const res = NextResponse.redirect(url, { status: 302 });
      res.cookies.set("NEXT_LOCALE", locale, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
      return res;
    }
  }

  // ?country=US — inject x-burrowsoft-geo so detectCountry() returns the simulated country
  const devCountry = searchParams.get("country");
  if (devCountry) {
    const intlRes = intlMiddleware(req);
    if (intlRes.status >= 300 && intlRes.status < 400) return intlRes;
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-burrowsoft-geo", devCountry.toUpperCase());
    const res = NextResponse.next({ request: { headers: newHeaders } });
    intlRes.headers.forEach((value, key) => {
      if (key === "set-cookie") res.headers.append(key, value);
    });
    return res;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|BingSiteAuth|.*\\..*).*)"],
};
