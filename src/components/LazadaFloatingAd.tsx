"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

const ADS = [
  {
    id: "lazada-1",
    label: "ช้อปสินค้าที่ Lazada",
    subLabel: "ส่วนลดสุดพิเศษวันนี้ →",
    url: "https://s.lazada.co.th/s.ZhTKMF?c=b&t=p-i6RvCVf-sRab381",
  },
  {
    id: "lazada-2",
    label: "Lazada Flash Sale",
    subLabel: "ราคาพิเศษทุกวัน →",
    url: "https://s.lazada.co.th/s.ZhTKLe?c=a&t=p-iHa6GOt-s2EYQBV0",
  },
] as const;

export function LazadaFloatingAd() {
  const locale = useLocale();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (locale !== "th") return null;

  const visible = ADS.filter((ad) => !dismissed.has(ad.id));
  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2" aria-label="Promotions">
      {visible.map((ad) => (
        <div
          key={ad.id}
          className="flex items-stretch overflow-hidden rounded-xl border border-orange-200 bg-white shadow-lg"
        >
          {/* Lazada orange accent strip */}
          <div className="w-1.5 shrink-0 bg-orange-500" />

          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col justify-center px-3 py-2.5 hover:bg-orange-50 transition-colors"
          >
            <span className="text-xs font-bold text-slate-800">{ad.label}</span>
            <span className="mt-0.5 text-[11px] font-medium text-orange-600">{ad.subLabel}</span>
          </a>

          <button
            onClick={() => setDismissed((prev) => new Set([...prev, ad.id]))}
            className="flex items-center justify-center px-2 text-slate-300 hover:text-slate-500 transition-colors"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
