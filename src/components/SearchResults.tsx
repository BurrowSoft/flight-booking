"use client";

import { useState, useMemo } from "react";
import type { Flight, SortOption } from "@/lib/types";
import { FlightCard } from "./FlightCard";
import { BookingModal } from "./BookingModal";
import { AdUnit } from "./AdUnit";
import { useFormatPrice } from "./CurrencyProvider";

interface Props {
  flights: Flight[];
  originCity: string;
  destinationCity: string;
  date: string;
}

export function SearchResults({ flights, originCity, destinationCity, date }: Props) {
  const fmt = useFormatPrice();
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // null = no limit
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(new Set());

  const allAirlines = useMemo(
    () => [...new Set(flights.map((f) => f.airline.name))],
    [flights]
  );

  const maxFlightPrice = useMemo(
    () => Math.max(...flights.map((f) => f.price), 0),
    [flights]
  );

  const toggleAirline = (name: string) => {
    setSelectedAirlines((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const effectiveMax = maxPrice ?? maxFlightPrice;

  const filtered = useMemo(() => {
    return flights
      .filter((f) => maxPrice === null || f.price <= maxPrice)
      .filter((f) => !directOnly || f.stops === 0)
      .filter((f) => selectedAirlines.size === 0 || selectedAirlines.has(f.airline.name));
  }, [flights, maxPrice, directOnly, selectedAirlines]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price": return a.price - b.price;
        case "duration": return a.durationMinutes - b.durationMinutes;
        case "departure": return a.departureTime.localeCompare(b.departureTime);
        case "arrival": return a.arrivalTime.localeCompare(b.arrivalTime);
        default: return 0;
      }
    });
  }, [filtered, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "price", label: "Cheapest" },
    { value: "duration", label: "Shortest" },
    { value: "departure", label: "Earliest departure" },
    { value: "arrival", label: "Earliest arrival" },
  ];

  return (
    <>
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filters sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>

          {/* Max price */}
          <div>
            <label className="mb-2 flex justify-between text-xs font-medium text-slate-600">
              <span>Max price</span>
              <span className="font-semibold text-sky-600">
                {maxPrice === null || maxPrice >= maxFlightPrice ? "Any" : fmt(maxPrice)}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={maxFlightPrice}
              step={50}
              value={effectiveMax}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Direct only */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(e) => setDirectOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 accent-sky-600"
            />
            <span className="text-sm text-slate-700">Direct flights only</span>
          </label>

          {/* Airlines */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Airlines</p>
            <div className="space-y-2">
              {allAirlines.map((name) => (
                <label key={name} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.has(name)}
                    onChange={() => toggleAirline(name)}
                    className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                  />
                  <span className="text-sm text-slate-700">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setMaxPrice(null);
              setDirectOnly(false);
              setSelectedAirlines(new Set());
            }}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Reset filters
          </button>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {/* Sort bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{sorted.length}</strong> flights found
            {" · "}
            <span className="text-slate-500">{originCity} → {destinationCity}</span>
            {date && <span className="text-slate-400"> · {date}</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? "bg-sky-600 text-white"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-lg font-medium text-slate-400">No flights match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting the filters or date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((flight, i) => (
              <>
                <FlightCard key={flight.id} flight={flight} onSelect={setSelectedFlight} />
                {/* Ad unit after the 3rd result — high visibility, low disruption */}
                {i === 2 && (
                  <AdUnit key="ad-mid" slot="SEARCH_MID_SLOT" format="horizontal" className="rounded-xl border border-slate-100 bg-white" />
                )}
              </>
            ))}
          </div>
        )}
      </div>
    </div>

    {selectedFlight && (
      <BookingModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
    )}
    </>
  );
}
