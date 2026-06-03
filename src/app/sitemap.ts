import type { MetadataRoute } from "next";
import { POPULAR_ROUTES } from "@/lib/data";
import { routing } from "@/i18n/routing";

const BASE = "https://www.flymole.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Home page — one entry per locale
  for (const locale of routing.locales) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    entries.push({
      url: `${BASE}${prefix}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    });
  }

  // Flight route pages — English + all locales
  for (const route of POPULAR_ROUTES) {
    for (const locale of routing.locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${BASE}${prefix}/flights/${route.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  return entries;
}
