"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { CabinClass, TripType } from "@/lib/types";
import { AirportInput } from "./AirportInput";

interface FormState {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  cabinClass: CabinClass;
}

const today = new Date().toISOString().split("T")[0] ?? "";
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] ?? "";

const initialState: FormState = {
  tripType: "roundtrip",
  origin: "JFK",
  destination: "LHR",
  departDate: nextWeek,
  returnDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] ?? "",
  adults: 1,
  children: 0,
  cabinClass: "economy",
};

const cabinLabels: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First Class",
};

export function FlightSearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const t = useTranslations("search");
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      setError("Please select origin and destination airports.");
      return;
    }
    if (form.origin === form.destination) {
      setError("Origin and destination must be different.");
      return;
    }
    if (!form.departDate) {
      setError("Please select a departure date.");
      return;
    }
    const params = new URLSearchParams({
      from: form.origin,
      to: form.destination,
      date: form.departDate,
      adults: String(form.adults),
      children: String(form.children),
      cabin: form.cabinClass,
      trip: form.tripType,
      ...(form.tripType === "roundtrip" && form.returnDate ? { return: form.returnDate } : {}),
    });
    router.push(`/search?${params.toString()}`);
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide";

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl bg-white shadow-xl ${compact ? "p-4" : "p-6"}`}
    >
      {/* Trip type tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {(["roundtrip", "oneway"] as TripType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => set("tripType", type)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              form.tripType === type
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {type === "roundtrip" ? t("roundTrip") : t("oneWay")}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>
        <AirportInput
          id="origin"
          label={t("from")}
          value={form.origin}
          onChange={(code) => set("origin", code)}
          exclude={form.destination}
        />
        <AirportInput
          id="destination"
          label={t("to")}
          value={form.destination}
          onChange={(code) => set("destination", code)}
          exclude={form.origin}
        />

        <div>
          <label className={labelCls} htmlFor="depart">{t("departure")}</label>
          <input
            id="depart"
            type="date"
            min={today}
            value={form.departDate}
            onChange={(e) => set("departDate", e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="return">{t("return")}</label>
          <input
            id="return"
            type="date"
            min={form.departDate}
            value={form.returnDate}
            disabled={form.tripType === "oneway"}
            onChange={(e) => set("returnDate", e.target.value)}
            className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className={labelCls} htmlFor="adults">Adults</label>
          <select id="adults" value={form.adults} onChange={(e) => set("adults", Number(e.target.value))} className={inputCls}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="children">Children</label>
          <select id="children" value={form.children} onChange={(e) => set("children", Number(e.target.value))} className={inputCls}>
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Child" : "Children"}</option>)}
          </select>
        </div>

        <div className="col-span-2 md:col-span-2">
          <label className={labelCls} htmlFor="cabin">Cabin Class</label>
          <select id="cabin" value={form.cabinClass} onChange={(e) => set("cabinClass", e.target.value as CabinClass)} className={inputCls}>
            {Object.entries(cabinLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}

      <div className="mt-5">
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-sky-700 active:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          {t("search")}
        </button>
      </div>
    </form>
  );
}
