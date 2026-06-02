import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only auto-set locale if no preference cookie exists yet
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      "";
    const locale = country === "TH" ? "th" : "en";
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Skip API routes, Next.js internals, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
