export interface FlightAffiliateLink {
  id: string;
  name: string;
  description: string;
  url: string;
  /** ISO country codes this link is shown for, or "all" */
  countries: string[] | "all";
}

interface FlightSearchParams {
  from: string;         // IATA origin e.g. "BKK"
  to: string;           // IATA destination e.g. "HKT"
  date: string;         // YYYY-MM-DD departure
  returnDate?: string;  // YYYY-MM-DD return — omit for one-way
  adults: number;
  country: string;      // ISO-3166-1 visitor country for gating
}

// ── Affiliate configs ──────────────────────────────────────────────────────────

const AFFILIATES: Array<Omit<FlightAffiliateLink, "url"> & {
  buildUrl: (p: FlightSearchParams) => string;
}> = [
  {
    id: "tripcom",
    name: "Trip.com",
    description: "Compare hundreds of airlines worldwide",
    countries: "all",
    buildUrl: ({ from, to, date, returnDate, adults }) => {
      const tripType = returnDate ? "D" : "S";
      const params = new URLSearchParams({
        flighttype: tripType,
        dcity: from,
        acity: to,
        ddate: date,
        adult: String(adults),
        Allianceid: "8495775",
        SID: "316966000",
        trip_sub1: "",
        trip_sub3: "D17566096",
        ...(returnDate ? { rdate: returnDate } : {}),
      });
      return `https://www.trip.com/flights/${from}-${to}/tickets-${from}-${to}?${params}`;
    },
  },
  {
    id: "expedia",
    name: "Expedia",
    description: "Book flights with free cancellation options",
    countries: "all",
    buildUrl: ({ from, to, date, returnDate, adults }) => {
      const isRoundtrip = !!returnDate;
      const leg1 = `from:${from},to:${to},departure:${date}TANYT`;
      const params = new URLSearchParams({
        trip: isRoundtrip ? "roundtrip" : "oneway",
        leg1,
        ...(isRoundtrip && returnDate
          ? { leg2: `from:${to},to:${from},departure:${returnDate}TANYT` }
          : {}),
        passengers: `adults:${adults},children:0,infantsinlap:0`,
        mode: "search",
        clickref: "1011lDaf5v7r",
        affcid: "US.DIRECT.PHG.1011l432356.1101l81954",
        afflid: "1011lDaf5v7r",
        affdtl: "PHG.1011lDaf5v7r.PZ0lLz9DyY",
      });
      return `https://www.expedia.com/Flights-Search?${params}`;
    },
  },

  // ── Country-specific partners (add future ones here) ──────────────────────
  // Example structure for Brazil — wire up when Milhas affiliate is approved:
  // {
  //   id: "milhas",
  //   name: "123milhas",
  //   description: "Voos nacionais e internacionais",
  //   countries: ["BR"],
  //   buildUrl: ({ from, to, date }) =>
  //     `https://123milhas.com/v2/passagens/${from}/${to}/${date}/1/0/0/E?utm_source=burrowsoft`,
  // },
];

// ── Public API ─────────────────────────────────────────────────────────────────

/** Returns affiliate links visible to the visitor's country, with URLs pre-filled. */
export function buildFlightAffiliateLinks(params: FlightSearchParams): FlightAffiliateLink[] {
  return AFFILIATES
    .filter(a =>
      a.countries === "all" ||
      a.countries.includes(params.country)
    )
    .map(({ buildUrl, ...rest }) => ({
      ...rest,
      url: buildUrl(params),
    }));
}
