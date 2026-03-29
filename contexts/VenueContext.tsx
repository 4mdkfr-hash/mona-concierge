"use client";

import { createContext, useContext } from "react";

interface VenueContextValue {
  venueId: string;
}

export const VenueContext = createContext<VenueContextValue | null>(null);

export function useVenue(): VenueContextValue {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error("useVenue must be used within DashboardLayout");
  return ctx;
}
