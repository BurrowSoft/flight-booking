"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Flight, FlightProviderOffer } from "@/lib/types";
import { FlightLoadingOverlay, type ProviderStatus } from "./FlightLoadingOverlay";
import { SearchResults } from "./SearchResults";

interface SearchQuery {
  from: string;
  to: string;
  date: string;
  adults: number;
  cabin: string;
  currency: string;
  country: string;
}

interface Props {
  query: SearchQuery;
  providerNames: string[];
  originCity: string;
  destinationCity: string;
}

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Groups flights that represent the same physical journey across providers.
 * Key: origin + destination + departure time + arrival time.
 * Keeps the cheapest price as the lead; attaches allOffers when multiple providers found it.
 */
function deduplicateFlights(flights: Flight[]): Flight[] {
  const groups = new Map<string, Flight[]>();

  for (const flight of flights) {
    const key = `${flight.origin.code}_${flight.destination.code}_${flight.departureTime}_${flight.arrivalTime}`;
    const group = groups.get(key);
    if (group) {
      group.push(flight);
    } else {
      groups.set(key, [flight]);
    }
  }

  const result: Flight[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      if (group[0]) result.push(group[0]);
      continue;
    }
    // Sort by price ascending; cheapest becomes the canonical entry
    group.sort((a, b) => a.price - b.price);
    const cheapest = group[0];
    if (!cheapest) continue;

    const allOffers: FlightProviderOffer[] = group.map((f) => ({
      provider: f.provider,
      price: f.price,
      bookingUrl: f.bookingUrl,
    }));

    result.push({ ...cheapest, allOffers });
  }
  return result;
}

export function FlightResults({ query, providerNames, originCity, destinationCity }: Props) {
  const t = useTranslations("results");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdatedRef = useRef<Date | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const fetchFlights = useCallback(
    async (isRefresh = false) => {
      const providers =
        providerNames.length > 0
          ? providerNames
          : ["Kiwi", "Skyscanner", "Booking.com Flights"];

      setProviderStatuses(providers.map((name) => ({ name, status: "loading" })));
      setOverlayVisible(true);
      if (isRefresh) setOverlayMessage(t("fetchingPrices"));
      else setOverlayMessage(undefined);

      if (!isRefresh) setFlights([]);

      const incoming: Flight[] = [];
      const base = new URLSearchParams({
        from: query.from,
        to: query.to,
        date: query.date,
        adults: String(query.adults),
        cabin: query.cabin,
        currency: query.currency,
        country: query.country,
      });

      await Promise.allSettled(
        providers.map(async (providerName) => {
          try {
            const res = await fetch(
              `/api/flights?${base.toString()}&provider=${encodeURIComponent(providerName)}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as { flights: Flight[] };
            const provFlights = data.flights ?? [];
            incoming.push(...provFlights);

            setFlights((prev) => {
              if (isRefresh) {
                const others = prev.filter((f) => f.provider !== providerName);
                return [...others, ...provFlights];
              }
              const existingIds = new Set(prev.map((f) => f.id));
              const fresh = provFlights.filter((f) => !existingIds.has(f.id));
              return [...prev, ...fresh];
            });

            setProviderStatuses((prev) =>
              prev.map((p) => (p.name === providerName ? { ...p, status: "done" } : p))
            );
          } catch {
            setProviderStatuses((prev) =>
              prev.map((p) => (p.name === providerName ? { ...p, status: "error" } : p))
            );
          }
        })
      );

      const now = new Date();
      setLastUpdated(now);
      lastUpdatedRef.current = now;

      if (isRefresh && incoming.length === 0) {
        const prev = lastUpdatedRef.current;
        const hhmm = prev
          ? prev.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "";
        showToast(t("pricesAsOf", { time: hhmm }));
      }
    },
    [query, providerNames, showToast]
  );

  // Initial load
  useEffect(() => {
    fetchFlights(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schedule auto-refresh after 5 minutes
  useEffect(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => fetchFlights(true), REFRESH_MS);
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [fetchFlights]);

  const allSettled =
    providerStatuses.length > 0 && providerStatuses.every((p) => p.status !== "loading");

  // Apply deduplication after all providers have resolved
  const displayFlights = useMemo(
    () => (allSettled ? deduplicateFlights(flights) : flights),
    [flights, allSettled]
  );

  const hhmm = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <>
      {overlayVisible && (
        <FlightLoadingOverlay
          providers={providerStatuses}
          message={overlayMessage}
          onDismissed={() => setOverlayVisible(false)}
        />
      )}

      {/* Prices timestamp */}
      {lastUpdated && allSettled && !overlayVisible && (
        <p className="mb-4 text-xs text-slate-400">
          {t("pricesAsOf", { time: hhmm })} —{" "}
          <button
            onClick={() => fetchFlights(true)}
            className="underline hover:text-sky-600 transition-colors"
          >
            {t("refresh")}
          </button>
        </p>
      )}

      {/* Results or empty state */}
      {displayFlights.length > 0 ? (
        <SearchResults
          flights={displayFlights}
          originCity={originCity}
          destinationCity={destinationCity}
          date={query.date}
        />
      ) : allSettled ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
          <p className="text-lg font-medium text-slate-400">{t("noneFound")}</p>
          <p className="mt-2 text-sm text-slate-400">{t("noneFoundHint")}</p>
        </div>
      ) : null}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
          {toast}
        </div>
      )}
    </>
  );
}
