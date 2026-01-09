"use client";

import { User } from "next-auth";
import { Booking, Cabin } from "@/prisma/generated/client";
import { useReservation } from "../_context/ReservationContext";
import Image from "next/image";
import SubmitButton from "./SubmitButton";
import { useEffect } from "react";

const formatDateForInput = (date: Date | undefined) => {
  return date ? date.toISOString().split("T")[0] : "";
};

function ReservationForm({
  cabin,
  user,
  action,
  booking,
}: {
  cabin: Cabin;
  user: User;
  action: CallableFunction;
  booking?: Booking;
}) {
  const { range, resetRange, setRange } = useReservation();
  const { maxCapacity, id } = cabin;

  useEffect(() => {
    setRange({ from: booking?.checkInDate, to: booking?.checkOutDate });
  }, [booking?.checkInDate, booking?.checkOutDate, setRange]);

  return (
    <div>
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          {user.image && (
            <Image
              width={32}
              height={32}
              // Important to display google profile images
              referrerPolicy="no-referrer"
              className="h-8 rounded-full"
              src={user.image}
              alt={user.name ?? ""}
            />
          )}
          <p>{user.name}</p>
        </div>
      </div>
      <form
        action={async (formData) => {
          await action(formData);
          resetRange();
        }}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col">
        <div className="hidden">
          <label htmlFor="cabinId"></label>
          <input type="number" name="cabinId" value={id} readOnly />
        </div>
        <div className="hidden">
          <label htmlFor="bookingId"></label>
          <input type="number" name="bookingId" value={booking?.id} readOnly />
        </div>
        <div className="hidden">
          <label htmlFor="checkInDate"></label>
          <input
            type="date"
            name="checkInDate"
            value={formatDateForInput(range.from)}
            readOnly
          />
        </div>
        <div className="hidden">
          <label htmlFor="checkOutDate"></label>
          <input
            type="date"
            name="checkOutDate"
            value={formatDateForInput(range.to)}
            readOnly
          />
        </div>
        <div className="hidden">
          <label htmlFor="bookingId"></label>
          <input type="number" name="bookingId" value={booking?.id} readOnly />
        </div>
        <div className="space-y-2">
          <label htmlFor="numberOfGuests">How many guests?</label>
          <select
            name="numberOfGuests"
            id="numberOfGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            defaultValue={booking?.numberOfGuests}
            required>
            <option key="">Select number of guests...</option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <input type="checkbox" name="hasBreakfast" id="hasBreakfast" />
          <label className="ml-2" htmlFor="hasBreakfast" defaultChecked>
            Do you want to include breakfast?
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
            defaultValue={booking?.observations ?? ""}
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          {!(range.from && range.to) ? (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          ) : (
            <SubmitButton pendingLabel="Reserving...">Reserve now</SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
