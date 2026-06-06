import type { NewsProvider } from "./types";
import type { NewsSearchParams, NewsArticle, NewsCategory } from "../../types";
import { fetchRSSFeed } from "./rss";

const FEED_BY_CATEGORY: Record<NewsCategory, string> = {
  general:       "https://g1.globo.com/rss/g1/index.xml",
  business:      "https://g1.globo.com/rss/g1/economia/index.xml",
  technology:    "https://g1.globo.com/rss/g1/tecnologia/index.xml",
  sports:        "https://g1.globo.com/rss/g1/esportes/index.xml",
  entertainment: "https://g1.globo.com/rss/g1/index.xml",
  health:        "https://g1.globo.com/rss/g1/bemestar/index.xml",
  science:       "https://g1.globo.com/rss/g1/ciencia-e-saude/index.xml",
};

export class G1RSSProvider implements NewsProvider {
  readonly name = "G1 Globo";
  readonly supportedCountries = ["BR"];

  async search(params: NewsSearchParams): Promise<NewsArticle[]> {
    const category = params.category ?? "general";
    const feedUrl = FEED_BY_CATEGORY[category];
    return fetchRSSFeed({ url: feedUrl, sourceName: "G1 Globo", language: "pt", category });
  }
}
