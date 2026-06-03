import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

async function loadMessages(locale: string) {
  switch (locale) {
    case "th":    return (await import("../messages/th.json")).default;
    case "es":    return (await import("../messages/es.json")).default;
    case "ru":    return (await import("../messages/ru.json")).default;
    case "pt-BR": return (await import("../messages/pt-BR.json")).default;
    case "fr":    return (await import("../messages/fr.json")).default;
    case "ja":    return (await import("../messages/ja.json")).default;
    case "zh":    return (await import("../messages/zh.json")).default;
    case "zh-TW": return (await import("../messages/zh-TW.json")).default;
    case "ar":    return (await import("../messages/ar.json")).default;
    case "de":    return (await import("../messages/de.json")).default;
    case "id":    return (await import("../messages/id.json")).default;
    case "ko":    return (await import("../messages/ko.json")).default;
    case "it":    return (await import("../messages/it.json")).default;
    case "vi":    return (await import("../messages/vi.json")).default;
    default:      return (await import("../messages/en.json")).default;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: await loadMessages(locale),
  };
});
