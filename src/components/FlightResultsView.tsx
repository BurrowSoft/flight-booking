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
  currency: string;
}

const WIDGET_LOCALE: Record<string, string> = {
  en: "en", th: "th", es: "es", ru: "ru",
  "pt-BR": "pt", fr: "fr", ja: "ja", zh: "zh",
  "zh-TW": "zh", ar: "ar", de: "de", id: "id",
  ko: "ko", it: "it", vi: "vi",
};

export function FlightResultsView({ from, to, date, returnDate, adults, locale, country, currency }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [kiwiLoaded, setKiwiLoaded] = useState(false);

  const affiliateLinks = buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setKiwiLoaded(false);
    container.innerHTML = "";

    const params = new URLSearchParams({
      trs: "535682",
      shmarker: "735444",
      powered_by: "true",
      campaign_id: "111",
      promo_id: "4478",
      show_header: "true",
      limit: "3",
      currency: currency.toLowerCase(),
      primary_color: "00AE98",
      results_background_color: "FFFFFF",
      form_background_color: "FFFFFF",
      locale: WIDGET_LOCALE[locale] ?? "en",
      from_name: from,
      to_name: to,
      departure: date,
      stops: "0",
      ...(returnDate ? { return: returnDate } : {}),
    });

    const observer = new MutationObserver(() => {
      if (container.children.length > 0) {
        setKiwiLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = `https://tpscr.com/content?${params}`;
    container.appendChild(script);

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, [from, to, date, returnDate, locale, currency]);

  return (
    <div>
      {/* Action bar: Kiwi spinner + affiliate buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium">
          {!kiwiLoaded && (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          Kiwi Results
        </div>

        {affiliateLinks.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            {link.name} Results
            <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      {/* Kiwi widget */}
      <div ref={containerRef} className="w-full min-h-[400px]" />
    </div>
  );
}
