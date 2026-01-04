import { BookingStatus } from "@/prisma/generated/enums";
import { prisma } from "./prisma";

export async function getSettings() {
  setTimeout(() => {}, 4000);
  return await prisma.settings.findFirst();
}

export async function getBookedDatesByCabinId(cabinId: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return await prisma.booking.findMany({
    where: {
      cabinId,
      checkInDate: { gte: today },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  });
}
