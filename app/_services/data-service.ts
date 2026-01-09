import { BookingStatus } from "@/prisma/generated/enums";
import { prisma } from "../_lib/prisma";
import { Guest } from "@/prisma/generated/client";
import { GuestSchema } from "../_lib/schemas";
import z from "zod";
import { notFound } from "next/navigation";
import { CabinSelect, CabinWhereInput } from "@/prisma/generated/models";

export async function getCabins(
  select: CabinSelect = {
    id: true,
    name: true,
    description: true,
    maxCapacity: true,
    regularPrice: true,
    discount: true,
    image: true,
  },
  where: CabinWhereInput = {}
) {
  return await prisma.cabin.findMany({
    select,
    where,
  });
}

export async function getCabin(id: number, select?: CabinSelect) {
  const cabin = await prisma.cabin.findUnique({
    where: { id: Number(id) },
    select,
  });
  if (!cabin) notFound();
  return cabin;
}

export async function getGuest(email: string | null | undefined) {
  if (!email) return null;
  return await prisma.guest.findUnique({ where: { email } });
}

export async function createGuest(guest: Partial<Guest>) {
  const { success, error, data } = GuestSchema.safeParse(guest);
  if (!success)
    throw new Error(`Validation Error: ${z.treeifyError(error).errors}`);
  return await prisma.guest.create({ data });
}

export async function getSettings() {
  return await prisma.settings.findFirst();
}

export async function getBooking(id: number) {
  return await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: { cabin: true },
  });
}

export async function getBookings(guestId: number) {
  return await prisma.booking.findMany({
    where: { guestId },
    include: { cabin: { select: { image: true, name: true } } },
  });
}

export async function getBookedDatesByCabinId(
  cabinId: number,
  bookingId?: number
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const bookedDates = await prisma.booking.findMany({
    where: {
      cabinId: Number(cabinId),
      checkInDate: { gte: today },
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      id: { not: bookingId },
    },
    select: { checkInDate: true, checkOutDate: true },
  });
  return bookedDates.map((booking) => ({
    from: booking.checkInDate,
    to: booking.checkOutDate,
  }));
}
