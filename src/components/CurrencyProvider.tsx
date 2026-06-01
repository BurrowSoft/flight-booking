"use client";

import { createContext, useContext } from "react";
import type { CurrencyInfo } from "@/lib/currency";
import { formatPrice } from "@/lib/currency";

const CurrencyContext = createContext<CurrencyInfo>({ code: "USD", rate: 1, locale: "en-US" });

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyInfo;
  children: React.ReactNode;
}) {
  return (
    <CurrencyContext.Provider value={currency}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function useFormatPrice() {
  const currency = useCurrency();
  return (amountUsd: number) => formatPrice(amountUsd, currency);
}
