import type { NewsArticle } from "../../types";
import type { NewsCategory } from "../../types";

/** Minimal RSS parser — no external dependencies. Works for Bangkok Post and G1 Globo feeds. */

function extractCDATA(block: string, tag: string): string {
  const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"));
  if (cdata?.[1]) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i"));
  return plain?.[1]?.trim() ?? "";
}

function extractAttr(block: string, tag: string, attr: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]+${attr}="([^"]*)"`, "i"));
  return match?.[1] ?? "";
}

export interface RSSFeedConfig {
  url: string;
  sourceName: string;
  language: string;
  category: NewsCategory;
}

export async function fetchRSSFeed(config: RSSFeedConfig): Promise<NewsArticle[]> {
  const res = await fetch(config.url, {
    next: { revalidate: 900 },
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BurrowSoftBot/1.0)" },
  });

  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  return items.slice(0, 20).map((item): NewsArticle => {
    const title = extractCDATA(item, "title");
    const description = extractCDATA(item, "description");
    const url = extractCDATA(item, "link") ||
      extractAttr(item, "link", "href") ||
      (item.match(/<link>([^<]+)<\/link>/i)?.[1] ?? "");
    const publishedAt = extractCDATA(item, "pubDate") || extractCDATA(item, "dc:date") || "";

    // Try various image tag patterns
    const imageUrl =
      extractAttr(item, "enclosure", "url") ||
      extractAttr(item, "media:content", "url") ||
      extractAttr(item, "media:thumbnail", "url") ||
      "";

    return {
      id: url,
      title,
      description: description || null,
      url,
      imageUrl: imageUrl || null,
      publishedAt,
      source: config.sourceName,
      provider: config.sourceName,
    };
  }).filter(a => a.title && a.url);
}
