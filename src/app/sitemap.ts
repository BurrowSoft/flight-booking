import type { MetadataRoute } from "next";
import { POPULAR_ROUTES } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  const routePages: MetadataRoute.Sitemap = POPULAR_ROUTES.map((route) => ({
    url: `${SITE_URL}/flights/${route.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticPages, ...routePages];
}
