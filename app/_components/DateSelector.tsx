"use client";

import { useReservation } from "@/app/_context/ReservationContext";
import { Cabin, Settings } from "@/prisma/generated/client";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function DateSelector({
  cabin,
  settings,
  bookedDates,
}: {
  cabin: Cabin;
  settings: Settings;
  bookedDates?: DateRange[];
}) {
  const { regularPrice, discount } = cabin;
  const { minBookingLength, maxBookingLength } = settings;

  const { range, setRange, resetRange } = useReservation();

  let numNights = null;
  if (range.to && range.from)
    numNights = (range.to - range.from) / (1000 * 60 * 60 * 24) || 0;

  console.log(bookedDates);

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        animate
        disabled={bookedDates}
        className="pt-12 ps-12 pe-12 pb-12 place-self-center"
        mode="range"
        onSelect={setRange}
        selected={range}
        min={minBookingLength}
        max={maxBookingLength}
        startMonth={new Date()}
        captionLayout="dropdown"
        numberOfMonths={2}
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-18">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">
                  ${regularPrice * numNights}
                </span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
