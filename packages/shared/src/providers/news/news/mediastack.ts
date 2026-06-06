import type { NewsProvider } from "./types";
import type { NewsSearchParams, NewsArticle, NewsCategory } from "../../types";

const CATEGORY_MAP: Record<NewsCategory, string> = {
  general:       "general",
  business:      "business",
  technology:    "technology",
  sports:        "sports",
  entertainment: "entertainment",
  health:        "health",
  science:       "science",
};

interface MediaStackArticle {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  published_at: string;
  source: string;
}

interface MediaStackResponse {
  data: MediaStackArticle[];
}

export class MediaStackProvider implements NewsProvider {
  readonly name = "MediaStack";
  readonly supportedCountries: string[] = [];

  constructor(
    private readonly apiKey: string,
    private readonly country: string,
    private readonly language: string
  ) {}

  async search(params: NewsSearchParams): Promise<NewsArticle[]> {
    const category = CATEGORY_MAP[params.category ?? "general"];
    const url = new URL("http://api.mediastack.com/v1/news");
    url.searchParams.set("access_key", this.apiKey);
    url.searchParams.set("countries", this.country.toLowerCase());
    url.searchParams.set("languages", this.language);
    url.searchParams.set("categories", category);
    url.searchParams.set("limit", String(params.pageSize ?? 20));

    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) return [];

    const data: MediaStackResponse = await res.json();
    if (!data.data) return [];

    return data.data.map((a): NewsArticle => ({
      id: a.url,
      title: a.title,
      description: a.description ?? null,
      url: a.url,
      imageUrl: a.image,
      publishedAt: a.published_at,
      source: a.source,
      provider: this.name,
    }));
  }
}
