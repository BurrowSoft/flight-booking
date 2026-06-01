"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Flight } from "@/lib/types";
import { formatDuration } from "@/lib/data";
import { getBookingOptions } from "@/lib/affiliate";
import { useFormatPrice } from "./CurrencyProvider";

interface Props {
  flight: Flight;
  onClose: () => void;
}


function ModalInner({ flight, onClose }: Props) {
  const fmt = useFormatPrice();
  const searchParams = useSearchParams();

  const date = searchParams.get("date") ?? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] ?? "";
  const adults = Number(searchParams.get("adults") ?? "1");

  const bookingOptions = getBookingOptions(flight, date, adults);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const baseFare = Math.round(flight.price * 0.78);
  const taxes = flight.price - baseFare;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — full height cap, scrollable body, sticky header + footer */}
      <div className="relative flex w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header — sticky so close button is always reachable */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between rounded-t-2xl sm:rounded-t-2xl border-b border-slate-100 bg-white px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">Flight Summary</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Airline + flight number */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-2xl text-sky-600">
              {flight.airline.logo}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{flight.airline.name}</p>
              <p className="text-sm text-slate-400">
                {flight.flightNumber} · {flight.cabinClass.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{flight.departureTime}</p>
              <p className="text-sm font-semibold text-slate-600">{flight.origin.code}</p>
              <p className="text-xs text-slate-400">{flight.origin.city}</p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <p className="text-xs text-slate-400">{formatDuration(flight.durationMinutes)}</p>
              <div className="h-px w-full bg-slate-300" />
              <p className="text-xs font-medium text-emerald-600">
                {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{flight.arrivalTime}</p>
              <p className="text-sm font-semibold text-slate-600">{flight.destination.code}</p>
              <p className="text-xs text-slate-400">{flight.destination.city}</p>
            </div>
          </div>

          {/* Fare breakdown */}
          <div className="space-y-2 rounded-xl border border-slate-100 px-4 py-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Base fare</span><span>{fmt(baseFare)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Taxes &amp; fees</span><span>{fmt(taxes)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Total per person</span>
              <span className="text-sky-600 text-lg">{fmt(flight.price)}</span>
            </div>
          </div>

          {/* Amenities */}
          {flight.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {flight.amenities.map((a) => (
                <span key={a} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  ✓ {a}
                </span>
              ))}
            </div>
          )}

          {flight.seatsLeft <= 5 && (
            <p className="text-sm font-medium text-red-500">
              ⚡ Only {flight.seatsLeft} seat{flight.seatsLeft > 1 ? "s" : ""} left at this price
            </p>
          )}
        </div>

        {/* CTAs — sticky so buttons are always visible */}
        <div className="sticky bottom-0 shrink-0 border-t border-slate-100 bg-white px-6 py-4 space-y-2">
          {bookingOptions.map((opt, i) => (
            <a
              key={opt.label}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                i === 0
                  ? "flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-sky-700 active:bg-sky-800 transition-colors"
                  : "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              }
            >
              {opt.label} ↗
            </a>
          ))}
          <p className="text-center text-xs text-slate-400 pt-1">
            Pre-filtered for{" "}
            <strong>{flight.origin.code} → {flight.destination.code}</strong> · {date}
          </p>
        </div>
      </div>
    </div>
  );
}

// useSearchParams requires Suspense
export function BookingModal(props: Props) {
  return (
    <Suspense fallback={null}>
      <ModalInner {...props} />
    </Suspense>
  );
}
