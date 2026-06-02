"use client";

import type { Flight } from "@/lib/types";
import { formatDuration } from "@/lib/data";
import { useFormatPrice } from "./CurrencyProvider";

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const fmt = useFormatPrice();
  const hasDiscount = flight.originalPrice && flight.originalPrice > flight.price;
  const discountPct = hasDiscount
    ? Math.round((1 - flight.price / flight.originalPrice!) * 100)
    : 0;

  return (
    <article
      className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
      aria-label={`${flight.airline.name} flight ${flight.flightNumber} — $${flight.price}`}
    >
      {/* Airline */}
      <div className="flex min-w-[140px] items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-sky-50 text-sky-600 text-xl">
          {flight.airline.logo.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flight.airline.logo}
              alt={flight.airline.name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            flight.airline.logo
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{flight.airline.name}</p>
          <p className="text-xs text-slate-400">{flight.flightNumber}</p>
          {/* Provider badge */}
          <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {flight.provider}
          </span>
        </div>
      </div>

      {/* Route timeline */}
      <div className="flex flex-1 items-center gap-3 sm:gap-6">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">{flight.departureTime}</p>
          <p className="text-xs font-medium text-slate-500">{flight.origin.code}</p>
          <p className="text-xs text-slate-400">{flight.origin.city}</p>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <p className="text-xs text-slate-400">{formatDuration(flight.durationMinutes)}</p>
          <div className="relative w-full">
            <div className="h-px w-full bg-slate-200" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              {flight.stops === 0 ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Direct
                </span>
              ) : (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  {flight.stops} stop
                </span>
              )}
            </div>
          </div>
          {flight.stopCities.length > 0 && (
            <p className="text-[10px] text-slate-400">via {flight.stopCities.join(", ")}</p>
          )}
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">{flight.arrivalTime}</p>
          <p className="text-xs font-medium text-slate-500">{flight.destination.code}</p>
          <p className="text-xs text-slate-400">{flight.destination.city}</p>
        </div>
      </div>

      {/* Amenities */}
      <div className="hidden flex-col gap-1 lg:flex min-w-[140px]">
        {flight.amenities.slice(0, 3).map((a) => (
          <span key={a} className="text-xs text-slate-500">
            ✓ {a}
          </span>
        ))}
      </div>

      {/* Price + CTAs */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="text-right">
          {hasDiscount && (
            <p className="text-xs text-slate-400 line-through">{fmt(flight.originalPrice!)}</p>
          )}
          <div className="flex items-baseline gap-1">
            {hasDiscount && (
              <span className="rounded bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600">
                -{discountPct}%
              </span>
            )}
            <p className="text-2xl font-bold text-sky-600">{fmt(flight.price)}</p>
          </div>
          <p className="text-xs text-slate-400">per person</p>
          {flight.seatsLeft <= 5 && (
            <p className="text-xs font-medium text-red-500">{flight.seatsLeft} seats left!</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {/* Primary: direct deep-link to the provider that found this deal */}
          <a
            href={flight.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 active:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 whitespace-nowrap"
          >
            Book on {flight.provider} ↗
          </a>
          {/* Secondary: open modal with all affiliate options */}
          <button
            onClick={() => onSelect?.(flight)}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 whitespace-nowrap"
          >
            Compare options
          </button>
        </div>
      </div>
    </article>
  );
}
