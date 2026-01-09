import { Booking, Cabin } from "@/prisma/generated/client";
import { auth } from "../_lib/auth";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";
import {
  getBookedDatesByCabinId,
  getSettings,
} from "../_services/data-service";
import { notFound } from "next/navigation";

async function Reservation({
  cabin,
  action,
  booking,
}: {
  cabin: Cabin;
  action: CallableFunction;
  booking?: Booking;
}) {
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id, booking?.id),
  ]);
  if (!settings) notFound();
  const session = await auth();
  return (
    <div className="grid grid-cols-1 border border-primary-800 min-h-100">
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabin={cabin}
      />
      {session?.user ? (
        <ReservationForm booking={booking} cabin={cabin} user={session.user} action={action} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
