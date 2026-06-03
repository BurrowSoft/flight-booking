import type { Metadata } from "next";
import { POPULAR_ROUTES } from "./data";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flymole.com";
export const SITE_NAME = "FlyMole";
export const SITE_DESCRIPTION =
  "Compare and book cheap flights from hundreds of airlines. Find the best deals on international and domestic flights.";

export function buildFlightRouteMetadata(
  originCity: string,
  destinationCity: string,
  minPrice?: number
): Metadata {
  const title = `Cheap Flights from ${originCity} to ${destinationCity}${minPrice ? ` from $${minPrice}` : ""} | ${SITE_NAME}`;
  const description = `Book cheap flights from ${originCity} to ${destinationCity}. Compare flights from top airlines, find the lowest fares${minPrice ? ` starting at $${minPrice}` : ""}. No hidden fees. Book now and save!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/flights/${originCity.toLowerCase().replace(/\s+/g, "-")}-to-${destinationCity.toLowerCase().replace(/\s+/g, "-")}`,
    },
  };
}

export function buildSearchMetadata(
  originCity: string,
  destinationCity: string,
  date: string
): Metadata {
  const title = `Flights from ${originCity} to ${destinationCity} on ${date} | ${SITE_NAME}`;
  const description = `Find the best flights from ${originCity} to ${destinationCity} on ${date}. Compare prices across airlines and book the cheapest flight.`;

  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?from={origin_airport}&to={destination_airport}&date={departure_date}`,
      },
      "query-input": [
        "required name=origin_airport",
        "required name=destination_airport",
        "required name=departure_date",
      ],
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function flightRouteJsonLd(
  originCity: string,
  destinationCity: string,
  originCode: string,
  destinationCode: string,
  minPrice: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Flights from ${originCity} to ${destinationCity}`,
    description: `Cheap flights from ${originCity} (${originCode}) to ${destinationCity} (${destinationCode})`,
    url: `${SITE_URL}/flights/${originCity.toLowerCase().replace(/\s+/g, "-")}-to-${destinationCity.toLowerCase().replace(/\s+/g, "-")}`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Offer",
          name: `${originCity} to ${destinationCity} Flight`,
          description: `Book flights from ${originCity} to ${destinationCity}`,
          price: minPrice,
          priceCurrency: "USD",
          url: `${SITE_URL}/flights/${originCity.toLowerCase().replace(/\s+/g, "-")}-to-${destinationCity.toLowerCase().replace(/\s+/g, "-")}`,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: SITE_NAME },
        },
      },
    ],
  };
}

export function getAllRoutesSlugs(): string[] {
  return POPULAR_ROUTES.map((r) => r.slug);
}
