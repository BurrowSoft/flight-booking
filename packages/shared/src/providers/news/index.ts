export { NewsAPIProvider } from "./newsapi";
export { GNewsProvider } from "./gnews";
export { GuardianNewsProvider } from "./guardian";
export type { NewsProvider } from "./types";

import { ProviderRouter } from "../base";
import { NewsAPIProvider } from "./newsapi";
import { GNewsProvider } from "./gnews";
import { GuardianNewsProvider } from "./guardian";
import type { NewsSearchParams, NewsArticle } from "../../types";

export function createNewsRouter(): ProviderRouter<NewsSearchParams, NewsArticle> {
  const providers = [];

  if (process.env.NEWS_API_KEY) {
    providers.push(new NewsAPIProvider(process.env.NEWS_API_KEY));
  }
  if (process.env.GNEWS_API_KEY) {
    providers.push(new GNewsProvider(process.env.GNEWS_API_KEY));
  }
  if (process.env.GUARDIAN_API_KEY) {
    providers.push(new GuardianNewsProvider(process.env.GUARDIAN_API_KEY));
  }

  return new ProviderRouter(providers);
}
