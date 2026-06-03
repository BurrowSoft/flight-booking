"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";

const LOCALE_NAMES: Record<string, string> = {
  en: "English", th: "ภาษาไทย", es: "Español", ru: "Русский",
  "pt-BR": "Português (BR)", fr: "Français", ja: "日本語",
  zh: "中文", "zh-TW": "繁體中文", ar: "العربية", de: "Deutsch",
  id: "Bahasa Indonesia", ko: "한국어", it: "Italiano", vi: "Tiếng Việt",
};

export function LocaleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <select
      value={locale}
      onChange={e => handleChange(e.target.value)}
      disabled={isPending}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
      aria-label="Select language"
    >
      {routing.locales.map(l => (
        <option key={l} value={l}>{LOCALE_NAMES[l] ?? l}</option>
      ))}
    </select>
  );
}
