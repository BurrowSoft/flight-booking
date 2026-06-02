# FlyMole — TODO6: Travelpayouts Widget Script (Thai users)

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports6.md when done.

## Task: inject Travelpayouts script for Thai locale only

Create `src/components/TravelpayoutsScript.tsx`:

```tsx
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
```

In `src/app/layout.tsx`, import and place inside `<body>` alongside `RegionalFloatingAd`:

```tsx
import { TravelpayoutsScript } from "@/components/TravelpayoutsScript";

// inside <body>:
<TravelpayoutsScript />
<RegionalFloatingAd />
```

## Verify
- EN locale: script is NOT injected (check browser Network tab — `tp-em.com` should not be called)
- TH locale: script loads from `https://tp-em.com/NTM1Njcy.js?t=535672`
- Switching locale EN → TH: script injects; TH → EN: script removed from head

## Commit and push + fill Reports6.md
