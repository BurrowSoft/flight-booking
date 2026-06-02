import { NextRequest, NextResponse } from "next/server";
import { createFlightRouter } from "@burrowsoft/shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "US";
  const router = createFlightRouter();
  const providers = router.getProvidersForCountry(country).map((p: { name: string }) => p.name);
  return NextResponse.json({ providers });
}
