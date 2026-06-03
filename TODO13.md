# TODO13: Flight — Trip.com affiliate debugging

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Fill in Reports13.md (root burrowsoft-web-apps/Reports13.md) when done.

---

## Issue — Trip.com flights return empty (JFK→BKK roundtrip)

**Problem:** Clicking the Trip.com affiliate link for JFK→BKK (June 10 – June 17) navigates to
`https://www.trip.com/flights/JFK-BKK/tickets-JFK-BKK?...` but shows 0 results.

**Root cause:** Either the URL format is wrong, or Trip.com has no inventory for this route.

**Debug:**

1. **Test the URL structure manually:**
   - Go to `https://www.trip.com/flights/` in your browser
   - Search for JFK → BKK, check-in 2026-06-10, check-out 2026-06-17, 1 adult, roundtrip
   - **Copy the resulting URL** — does it match the pattern we're generating?
   - Does it have `/flights/JFK-BKK/tickets-JFK-BKK?` or something different?

2. **Check the params in `packages/shared/src/affiliates/flights.ts`:**
   - `flighttype: "D"` for roundtrip — correct?
   - `dcity: "JFK"`, `acity: "BKK"` — are both uppercase?
   - `ddate: "2026-06-10"`, `rdate: "2026-06-17"` — correct YYYY-MM-DD format?
   - Are `Allianceid`, `SID`, `trip_sub*` values still valid? (Check with Trip.com docs)

3. **Simplify and test:**
   - Try a different route (BKK→HKT, both major Asian airports) to see if the issue is route-specific
   - Try a one-way flight (no `returnDate`) to isolate roundtrip logic
   - If BKK→HKT works, the issue is JFK→BKK inventory, not the URL format

4. **Check if Trip.com's flight affiliate program still works:**
   - Manually navigate to `https://www.trip.com/flights/` and check if it even accepts affiliate params
   - Trip.com may have changed their affiliate URL structure or deprecated flight affiliate links

**Possible fixes:**

- **URL format is wrong:** Update `buildUrl()` to match Trip.com's current working format
- **Params are wrong:** Fix `Allianceid`, `SID`, or other credentials in the code
- **Inventory is thin:** Only show Trip.com for routes you've verified have results (narrow `isAsianRoute()` filter)
- **Affiliate program broken:** Remove Trip.com flights entirely or mark it as "limited availability"

---

## Commit and push

Once you've identified the root cause, apply the fix or document the limitation:

```bash
git add -A
git commit -m "debug: Trip.com flight affiliate URL and inventory"
git push origin master
```
