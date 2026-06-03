export interface HotelAffiliateLink {
  id: string;
  name: string;
  description: string;
  url: string;
  /** ISO country codes this link is shown for, or "all" */
  countries: string[] | "all";
}

interface HotelSearchParams {
  destination: string;  // city name e.g. "Bangkok"
  checkin: string;      // YYYY-MM-DD
  checkout: string;     // YYYY-MM-DD
  guests: number;
  rooms: number;
  country: string;      // ISO-3166-1 visitor country for gating
}

// ── Affiliate configs ──────────────────────────────────────────────────────────

const AFFILIATES: Array<Omit<HotelAffiliateLink, "url"> & {
  buildUrl: (p: HotelSearchParams) => string;
}> = [
  {
    id: "expedia",
    name: "Expedia",
    description: "Compare hotels with free cancellation options",
    countries: "all",
    buildUrl: ({ destination, checkin, checkout, guests, rooms }) => {
      const params = new URLSearchParams({
        destination,
        startDate: checkin,
        endDate: checkout,
        d1: checkin,
        d2: checkout,
        rooms: String(rooms),
        adults: String(guests),
        sort: "RECOMMENDED",
        useRewards: "false",
        // PHG/Partnerize affiliate credentials — AU program
        // Update if switching to a different regional program
        clickref: "1101lDpu7jFI",
        affcid: "AU.DIRECT.PHG.1011l432356.1100l86802",
        ref_id: "1101lDpu7jFI",
        my_ad: "AFF.AU.DIRECT.PHG.1011l432356.1100l86802",
        afflid: "1101lDpu7jFI",
        affdtl: "PHG.1101lDpu7jFI.PZGjHMQLvC",
      });
      return `https://www.expedia.com/Hotel-Search?${params}`;
    },
  },
  {
    id: "tripcom",
    name: "Trip.com",
    description: "Great deals on hotels worldwide",
    // Trip.com hotel inventory is Asia-centric — thin/no results for EU/US destinations
    countries: ["CN","JP","KR","SG","TH","TW","HK","MY","ID","PH","VN","IN","MO","MM","KH","LA","BN","MV","LK","NP","BD","PK"],
    buildUrl: ({ destination, checkin, checkout, guests, rooms }) => {
      const params = new URLSearchParams({
        display: destination,
        optionType: "City",
        optionName: destination,
        checkIn: checkin,
        checkOut: checkout,
        adult: String(guests),
        room: String(rooms),
        Allianceid: "8495775",
        SID: "316966000",
        trip_sub1: "",
        trip_sub3: "D17566096",
      });
      return `https://www.trip.com/hotels/list?${params}`;
    },
  },

  // ── Country-specific partners (add future ones here) ──────────────────────
  // {
  //   id: "agoda",
  //   name: "Agoda",
  //   description: "Best prices in Asia",
  //   countries: "all",
  //   buildUrl: ({ destination, checkin, checkout, guests, rooms }) => { ... },
  // },
];

// ── Public API ─────────────────────────────────────────────────────────────────

/** Returns hotel affiliate links visible to the visitor's country, with URLs pre-filled. */
export function buildHotelAffiliateLinks(params: HotelSearchParams): HotelAffiliateLink[] {
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
