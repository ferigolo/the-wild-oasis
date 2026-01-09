import { format, formatDistance, isPast, isToday } from "date-fns";
import Image from "next/image";
import { Pencil } from "lucide-react";
import Link from "next/link";
import DeleteReservation from "./DeleteReservation";
import { Booking } from "@/prisma/generated/client";

export const formatDistanceFromNow = (dateStr: Date) =>
  formatDistance(dateStr, new Date(), {
    addSuffix: true,
  }).replace("about ", "");

function ReservationCard({
  booking,
}: {
  booking: Booking & { cabin: { image: string | null; name: string } };
}) {
  const {
    id,
    checkInDate,
    checkOutDate,
    cabinPrice,
    extrasPrice,
    numberOfGuests,
    createdAt,
    cabin: { image, name },
  } = booking;

  return (
    <div className="flex border border-primary-800">
      <div className="relative h-32 aspect-square">
        {image && (
          <Image
            fill
            src={image}
            alt={`Cabin ${name}`}
            className="object-cover border-r border-primary-800"
          />
        )}
      </div>

      <div className="grow px-6 py-3 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {Math.round(
              (checkOutDate.getTime() - checkInDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            nights in Cabin {name}
          </h3>
          {isPast(checkInDate) ? (
            <span className="bg-yellow-800 text-yellow-200 h-7 px-3 uppercase text-xs font-bold flex items-center rounded-sm">
              past
            </span>
          ) : (
            <span className="bg-green-800 text-green-200 h-7 px-3 uppercase text-xs font-bold flex items-center rounded-sm">
              upcoming
            </span>
          )}
        </div>

        <p className="text-lg text-primary-300">
          {format(checkInDate, "EEE, MMM dd yyyy")} (
          {isToday(checkInDate) ? "Today" : formatDistanceFromNow(checkInDate)})
          &mdash; {format(new Date(checkOutDate), "EEE, MMM dd yyyy")}
        </p>

        <div className="flex gap-5 mt-auto items-baseline">
          <p className="text-lg text-primary-300">
            {cabinPrice + (extrasPrice || 0)}
          </p>
          <p className="text-primary-300">&bull;</p>
          <p className="text-lg text-primary-300">
            {numberOfGuests} guest{numberOfGuests > 1 && "s"}
          </p>
          <p className="ml-auto text-sm text-primary-400">
            Booked {format(new Date(createdAt), "EEE, MMM dd yyyy, p")}
          </p>
        </div>
      </div>

      <div className="flex flex-col border-l border-primary-800 w-25">
        {!isPast(checkInDate) && (
          <>
            <Link
              href={`/account/reservations/edit/${id}`}
              className="group flex items-center gap-2 uppercase text-xs font-bold text-primary-300 border-b border-primary-800 grow px-3 hover:bg-accent-600 transition-colors hover:text-primary-900">
              <Pencil className="h-5 w-5 text-primary-600 group-hover:text-primary-800 transition-colors" />
              <span className="mt-1">Edit</span>
            </Link>
            <DeleteReservation bookingId={id} />
          </>
        )}
      </div>
    </div>
  );
}

export default ReservationCard;
