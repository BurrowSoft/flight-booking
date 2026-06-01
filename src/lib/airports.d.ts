declare module "airports" {
  interface RawAirport {
    iata: string;
    name: string;
    iso: string;       // ISO 3166-1 alpha-2 country code
    continent: string; // AS, EU, NA, SA, AF, OC, AN
    lat: string;
    lon: string;
    status: number;    // 1 = active
    size: "small" | "medium" | "large" | null;
    type: string;
  }
  const airports: RawAirport[];
  export = airports;
}
