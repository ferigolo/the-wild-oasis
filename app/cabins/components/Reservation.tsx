import { auth } from "@/app/_lib/auth";
import { Cabin } from "@/prisma/generated/client";
import { getBookedDatesByCabinId, getSettings } from "../../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

export default async function Reservation({ cabin }: { cabin: Cabin }) {
  const [settings, bookings] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);
  const session = await auth();

  return (
    <div className="grid grid-cols-2 border border-primary-800 min-h-100">
      <DateSelector settings={settings} bookedDates={bookings}></DateSelector>
      {session?.user ? (
        <ReservationForm cabin={cabin} user={session.user}></ReservationForm>
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
