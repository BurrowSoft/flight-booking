"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AIRPORTS } from "@/lib/data";

const ALL_AIRPORTS = Object.values(AIRPORTS)
  .filter((a) => !a.name.startsWith("?") && !a.city.startsWith("?"))
  .sort((a, b) => {
    // Large (primary) airports first within the same city, then alphabetical
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.city.localeCompare(b.city);
  });

// Curated popular airports shown when the query is empty
const POPULAR_CODES = [
  "JFK","LHR","CDG","DXB","SIN","HND","LAX","ORD","FRA","AMS",
  "MAD","BCN","FCO","LIS","ZRH","GRU","SYD","BKK","ICN","MUC",
  "YYZ","MEX","EZE","DEL","PEK","PVG","SVO","DFW","MIA","ATL",
];
const POPULAR_AIRPORTS = POPULAR_CODES.flatMap((c) => (AIRPORTS[c] ? [AIRPORTS[c]] : []));

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
}

export function AirportInput({ id, label, value, onChange, exclude }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = AIRPORTS[value];

  const filtered = query.length < 1
    ? POPULAR_AIRPORTS.filter((a) => a.code !== exclude)
    : ALL_AIRPORTS.filter((a) => {
        if (a.code === exclude) return false;
        const q = query.toLowerCase();
        return (
          a.code.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
        );
      }).slice(0, 10);

  const select = useCallback((code: string) => {
    onChange(code);
    setQuery("");
    setOpen(false);
  }, [onChange]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted].code); }
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  }

  const labelCls = "mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide";
  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className={labelCls}>{label}</label>

      {open ? (
        <input
          ref={inputRef}
          id={id}
          autoFocus
          placeholder="City, airport or code…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
          onKeyDown={onKeyDown}
          className={inputCls}
          aria-autocomplete="list"
          aria-expanded="true"
          role="combobox"
        />
      ) : (
        <button
          id={id}
          type="button"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          className={`${inputCls} text-left truncate`}
        >
          {selected
            ? <><span className="font-semibold">{selected.code}</span> — {selected.city}, {selected.country}</>
            : <span className="text-slate-400">Select airport</span>
          }
        </button>
      )}

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
          aria-label={query.length < 1 ? "Popular airports" : "Search results"}
        >
          {query.length < 1 && (
            <li className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Popular airports
            </li>
          )}
          {filtered.map((airport, i) => (
            <li
              key={airport.code}
              role="option"
              aria-selected={i === highlighted}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={() => select(airport.code)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${
                i === highlighted ? "bg-sky-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="w-10 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-center text-xs font-bold text-slate-700">
                {airport.code}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-900">
                  {airport.city}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  {airport.name} · {airport.country}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
