"use client";

import { useState } from "react";
import type { Flight } from "@/lib/types";
import { FlightCard } from "./FlightCard";
import { BookingModal } from "./BookingModal";

export function FlightList({ flights }: { flights: Flight[] }) {
  const [selected, setSelected] = useState<Flight | null>(null);

  return (
    <>
      <div className="space-y-3">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} onSelect={setSelected} />
        ))}
      </div>
      {selected && <BookingModal flight={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
