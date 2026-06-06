"use client";

import { useState, useEffect, useRef } from "react";
import { buildFlightAffiliateLinks, SpinnerIcon, ExternalLinkIcon } from "@burrowsoft/shared";

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

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = `https://tpscr.com/content?${params}`;
    container.appendChild(script);

    const timer = setTimeout(() => setKiwiLoaded(true), 3000);

    return () => {
      clearTimeout(timer);
      container.innerHTML = "";
    };
  }, [from, to, date, returnDate, locale, currency]);

  return (
    <div>
      {/* Action bar: Kiwi spinner + affiliate buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium">
          {!kiwiLoaded && <SpinnerIcon className="h-3.5 w-3.5" />}
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
            <ExternalLinkIcon className="w-3.5 h-3.5 opacity-60" />
          </a>
        ))}
      </div>

      {/* Kiwi widget */}
      <div ref={containerRef} className="w-full min-h-[400px]" />
    </div>
  );
}
