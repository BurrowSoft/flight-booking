"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function TravelpayoutsScript() {
  const locale = useLocale();

  useEffect(() => {
    if (locale !== "th") return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://tp-em.com/NTM1Njcy.js?t=535672";
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [locale]);

  return null;
}
