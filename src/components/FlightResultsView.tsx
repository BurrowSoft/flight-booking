"use client";

import { useState, useEffect, useRef } from "react";
import { buildFlightAffiliateLinks } from "@burrowsoft/shared";

interface Props {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  adults: number;
  locale: string;
  country: string;
}

type Mode = "kiwi" | "other";

const WIDGET_LOCALE: Record<string, string> = {
  en: "en", th: "th", es: "es", ru: "ru",
  "pt-BR": "pt", fr: "fr", ja: "ja", zh: "zh",
  "zh-TW": "zh", ar: "ar", de: "de", id: "id",
  ko: "ko", it: "it", vi: "vi",
};

export function FlightResultsView({ from, to, date, returnDate, adults, locale, country }: Props) {
  const [mode, setMode] = useState<Mode>("kiwi");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "kiwi") return;
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const params = new URLSearchParams({
      trs: "535682",
      shmarker: "735444",
      powered_by: "true",
      campaign_id: "111",
      promo_id: "4478",
      show_header: "true",
      limit: "3",
      currency: "usd",
      primary_color: "00AE98",
      results_background_color: "FFFFFF",
      form_background_color: "FFFFFF",
      locale: WIDGET_LOCALE[locale] ?? "en",
      from_name: from.toLowerCase(),
      to_name: to,
      departure: date,
      stops: "0",
      ...(returnDate ? { return: returnDate } : {}),
    });

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = `https://tpscr.com/content?${params}`;
    container.appendChild(script);

    return () => { container.innerHTML = ""; };
  }, [mode, from, to, date, returnDate, locale]);

  const links = buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country });

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["kiwi", "other"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {m === "kiwi" ? "Kiwi Results" : "Other Results"}
          </button>
        ))}
      </div>

      {/* Kiwi widget */}
      {mode === "kiwi" && (
        <div ref={containerRef} className="w-full min-h-[400px]" />
      )}

      {/* Affiliate deep links */}
      {mode === "other" && (
        <div className="grid gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
            >
              <div>
                <div className="font-semibold text-slate-900">{link.name}</div>
                <div className="text-sm text-slate-500 mt-0.5">{link.description}</div>
              </div>
              <div className="flex items-center gap-2 text-sky-600 font-medium text-sm">
                Search flights
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
