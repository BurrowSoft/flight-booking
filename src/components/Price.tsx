"use client";

import { useFormatPrice } from "./CurrencyProvider";

export function Price({ usd }: { usd: number }) {
  const fmt = useFormatPrice();
  return <>{fmt(usd)}</>;
}
