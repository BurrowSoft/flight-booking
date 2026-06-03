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

type Mode = "kiwi" | "other";
type SortKey = "price" | "duration" | "departure" | "stops";

// Matches the shape returned by /api/flights (after mapSharedFlight in route.ts)
interface FlightResult {
  id: string;
  airline: { code: string; name: string; logo: string };
  flightNumber: string;
  departureTime: string;  // "HH:MM"
  arrivalTime: string;    // "HH:MM"
  durationMinutes: number;
  stops: number;
  price: number;
  currency: string;
}

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const WIDGET_LOCALE: Record<string, string> = {
  en: "en", th: "th", es: "es", ru: "ru",
  "pt-BR": "pt", fr: "fr", ja: "ja", zh: "zh",
  "zh-TW": "zh", ar: "ar", de: "de", id: "id",
  ko: "ko", it: "it", vi: "vi",
};

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export function FlightResultsView({ from, to, date, returnDate, adults, locale, country, currency }: Props) {
  const [mode, setMode] = useState<Mode>("kiwi");
  const containerRef = useRef<HTMLDivElement>(null);
  const [kiwiLoaded, setKiwiLoaded] = useState(false);

  // "other" mode state
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("price");

  // Reset kiwi state when mode switches back to kiwi
  useEffect(() => {
    if (mode === "kiwi") setKiwiLoaded(false);
  }, [mode]);

  // Kiwi widget injection
  useEffect(() => {
    if (mode !== "kiwi") return;
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
  }, [mode, from, to, date, returnDate, locale, currency]);

  // Fetch real flights for "other" mode
  useEffect(() => {
    if (mode !== "other") return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      from, to, date,
      adults: String(adults),
      cabin: "economy",
      currency,
      country,
      ...(returnDate ? { return: returnDate } : {}),
    });

    fetch(`/api/flights?${params}`)
      .then(r => r.json())
      .then((data: { flights?: FlightResult[] }) => {
        setFlights(data.flights ?? []);
        setSortBy("price");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load flights. Try the links below.");
        setLoading(false);
      });
  }, [mode, from, to, date, returnDate, adults, country, currency]);

  const affiliateLinks = buildFlightAffiliateLinks({ from, to, date, returnDate, adults, country });

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case "price":    return a.price - b.price;
      case "duration": return a.durationMinutes - b.durationMinutes;
      case "stops":    return a.stops - b.stops;
      case "departure": return a.departureTime.localeCompare(b.departureTime);
      default: return 0;
    }
  });

  return (
    <div>
      {/* Mode toggle with spinner on active loading button */}
      <div className="flex gap-2 mb-6">
        {(["kiwi", "other"] as Mode[]).map((m) => {
          const isActive = m === mode;
          const isLoading = (m === "kiwi" && !kiwiLoaded) || (m === "other" && loading);
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isActive && isLoading && <Spinner />}
              {m === "kiwi" ? "Kiwi Results" : "Other Results"}
            </button>
          );
        })}
      </div>

      {/* Kiwi widget — kept mounted so script can inject */}
      <div className={mode === "kiwi" ? "block" : "hidden"}>
        <div ref={containerRef} className="w-full min-h-[400px]" />
      </div>

      {/* Other Results */}
      {mode === "other" && (
        <>
          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error banner */}
          {!loading && error && (
            <p className="text-sm text-slate-500 mb-4">{error}</p>
          )}

          {/* Sort bar + flight cards */}
          {!loading && sortedFlights.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                {(["price", "duration", "departure", "stops"] as SortKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sortBy === key
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {key === "price" ? "Cheapest" :
                     key === "duration" ? "Shortest" :
                     key === "departure" ? "Earliest" :
                     "Fewest stops"}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {sortedFlights.map(flight => (
                  <div
                    key={flight.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {flight.airline.logo && !flight.airline.logo.startsWith("http") ? (
                          <span className="text-xl">{flight.airline.logo}</span>
                        ) : flight.airline.logo ? (
                          <img src={flight.airline.logo} alt={flight.airline.name} className="h-6 w-6 object-contain" />
                        ) : null}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{flight.airline.name}</p>
                          <p className="text-xs text-slate-400">
                            {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-center px-2">
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {flight.departureTime} → {flight.arrivalTime}
                        </p>
                        <p className="text-xs text-slate-400">{fmtDuration(flight.durationMinutes)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-sky-600">
                          {flight.currency !== "USD" ? flight.currency + " " : "$"}{flight.price.toFixed(0)}
                        </p>
                        <p className="text-xs text-slate-400">per person</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {affiliateLinks.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg border border-slate-200 py-2 text-center
                                     text-xs font-semibold text-slate-700 hover:bg-slate-50
                                     hover:border-sky-300 hover:text-sky-700 transition-colors"
                        >
                          {link.name} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No results fallback */}
          {!loading && flights.length === 0 && (
            <div className="space-y-3">
              {affiliateLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200
                             bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{link.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{link.description}</p>
                  </div>
                  <span className="text-sky-600 text-sm font-medium">Search flights ↗</span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
