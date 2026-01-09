"use client";

import { createContext, ReactNode, use, useState } from "react";
import { DateRange } from "react-day-picker";

const initialState = {
  from: undefined,
  to: undefined,
} as DateRange;

const ReservationContext = createContext<
  | {
      range: DateRange | undefined;
      setRange: (range: DateRange | undefined) => void;
      resetRange: () => void;
    }
  | undefined
>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange | undefined>(initialState);

  function resetRange() {
    setRange(initialState);
  }

  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = use(ReservationContext);
  if (context == undefined) throw new Error("Context used outside provider");
  return context;
}
