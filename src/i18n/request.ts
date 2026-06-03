import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const LOCALES = [
  "en", "th", "es", "ru", "pt-BR", "fr", "ja", "zh", "zh-TW",
  "ar", "de", "id", "ko", "it", "vi",
] as const;

type Locale = (typeof LOCALES)[number];

function isValidLocale(v: string | undefined): v is Locale {
  return LOCALES.includes(v as Locale);
}

async function loadMessages(locale: Locale) {
  // Static imports per locale so the bundler can tree-shake unused message files.
  // pt-BR uses a hyphenated filename; dynamic template literals can't be used here
  // reliably across all bundler versions.
  switch (locale) {
    case "th":     return (await import("../messages/th.json")).default;
    case "es":     return (await import("../messages/es.json")).default;
    case "ru":     return (await import("../messages/ru.json")).default;
    case "pt-BR":  return (await import("../messages/pt-BR.json")).default;
    case "fr":     return (await import("../messages/fr.json")).default;
    case "ja":     return (await import("../messages/ja.json")).default;
    case "zh":     return (await import("../messages/zh.json")).default;
    case "zh-TW":  return (await import("../messages/zh-TW.json")).default;
    case "ar":     return (await import("../messages/ar.json")).default;
    case "de":     return (await import("../messages/de.json")).default;
    case "id":     return (await import("../messages/id.json")).default;
    case "ko":     return (await import("../messages/ko.json")).default;
    case "it":     return (await import("../messages/it.json")).default;
    case "vi":     return (await import("../messages/vi.json")).default;
    default:       return (await import("../messages/en.json")).default;
  }
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isValidLocale(raw) ? raw : "en";

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
