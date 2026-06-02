"use client";

import { useRouter } from "next/navigation";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "th", flag: "🇹🇭", label: "TH" },
] as const;

interface Props {
  current: string;
}

export function LanguageSelector({ current }: Props) {
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          aria-pressed={current === code}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            current === code
              ? "bg-sky-600 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span aria-hidden>{flag}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
