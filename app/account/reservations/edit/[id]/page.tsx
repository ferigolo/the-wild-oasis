import Reservation from "@/app/_components/Reservation";
import { updateReservation } from "@/app/_lib/actions";
import { getBooking } from "@/app/_services/data-service";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const booking = await getBooking((await params).id);
  if (!booking) notFound();
  return (
    <>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit reservation #{booking.id}
      </h2>
      <Reservation
        booking={booking}
        action={updateReservation}
        cabin={booking.cabin}
      />
    </>
  );
}
