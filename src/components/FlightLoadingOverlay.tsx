"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export interface ProviderStatus {
  name: string;
  status: "loading" | "done" | "error";
}

interface Props {
  providers: ProviderStatus[];
  message?: string;
  onDismissed?: () => void;
}

export function FlightLoadingOverlay({ providers, message, onDismissed }: Props) {
  const t = useTranslations("results");
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(true);

  const allSettled = providers.length > 0 && providers.every((p) => p.status !== "loading");

  useEffect(() => {
    if (!allSettled) return;
    // Start fade after a short pause so users see the final checkmarks
    const fadeTimer = setTimeout(() => setOpacity(0), 400);
    const removeTimer = setTimeout(() => {
      setMounted(false);
      onDismissed?.();
    }, 1000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [allSettled, onDismissed]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-500"
      style={{ opacity }}
      aria-live="polite"
      aria-label="Loading flight results"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
            <span
              className={`text-2xl ${allSettled ? "" : "inline-block animate-spin"}`}
              aria-hidden
            >
              ✈
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {message ?? t("findingFlights")}
          </p>
        </div>

        {/* Per-provider status */}
        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {p.status === "loading" && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
                )}
                {p.status === "done" && (
                  <span className="text-base leading-none text-emerald-500" aria-hidden>✓</span>
                )}
                {p.status === "error" && (
                  <span className="text-base leading-none text-slate-300" aria-hidden>−</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm transition-colors duration-300 ${
                  p.status === "loading"
                    ? "text-slate-700"
                    : p.status === "done"
                    ? "font-medium text-emerald-600"
                    : "text-slate-300"
                }`}
              >
                {p.status === "loading" && t("loading", { provider: p.name })}
                {p.status === "done" && `${p.name} ✓`}
                {p.status === "error" && t("unavailable", { provider: p.name })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
