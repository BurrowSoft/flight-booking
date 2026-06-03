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
    // Trip.com inventory is Asia-centric — thin/no results for EU/US routes
    countries: ["CN","JP","KR","SG","TH","TW","HK","MY","ID","PH","VN","IN","MO","MM","KH","LA","BN","MV","LK","NP","BD","PK"],
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
      // Expedia leg format: "from:{IATA},to:{IATA},departure:M/D/YYYYTANYT"
      const toExpediaDate = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${parseInt(m!)}/${parseInt(d!)}/${y}`;
      };
      const leg1 = `from:${from},to:${to},departure:${toExpediaDate(date)}TANYT`;
      const params = new URLSearchParams({
        "flight-type": "on",
        mode: "search",
        trip: isRoundtrip ? "roundtrip" : "oneway",
        leg1,
        ...(isRoundtrip && returnDate ? {
          leg2: `from:${to},to:${from},departure:${toExpediaDate(returnDate)}TANYT`,
          toDate: toExpediaDate(returnDate),
          d2: returnDate,
        } : {}),
        fromDate: toExpediaDate(date),
        d1: date,
        passengers: `children:0,adults:${adults},seniors:0,infantinlap:Y`,
        options: "cabinclass:economy",
        // PHG/Partnerize affiliate credentials — AU program (flight-specific)
        // Update affcid/clickref/afflid/affdtl if you switch to a different regional program
        clickref: "1011lDafjZ8I",
        affcid: "AU.DIRECT.PHG.1011l432356.1100l86802",
        ref_id: "1011lDafjZ8I",
        my_ad: "AFF.AU.DIRECT.PHG.1011l432356.1100l86802",
        afflid: "1011lDafjZ8I",
        affdtl: "PHG.1011lDafjZ8I.PZp1tdJx5a",
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
