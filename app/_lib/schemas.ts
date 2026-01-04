import { z } from "zod";
import { prisma } from "./prisma";
import { BookingStatus } from "@/prisma/generated/enums";

const MAX_FILE_SIZE = 50000000; // 50MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const bookingSchema = z
  .object({
    guestId: z.coerce
      .number()
      .min(1, "Guest ID is missing")
      .refine(
        async (guestId) =>
          await prisma.guest.findUnique({ where: { id: guestId } }),
        {
          message: "Guest with this ID not found",
        }
      ),
    cabinId: z.coerce
      .number()
      .min(1, "Cabin ID is missing")
      .refine(
        async (cabinId) =>
          await prisma.cabin.findUnique({ where: { id: cabinId } }),
        {
          message: "Cabin with this ID not found",
        }
      ),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    hasBreakfast: z.coerce.boolean().default(false),
    extrasPrice: z.coerce.number().default(0),
    isPaid: z.coerce.boolean().default(false),
    numberOfGuests: z.coerce
      .number()
      .min(1, "Guest number should be greater than 1")
      .default(1),
    cabinPrice: z.coerce
      .number()
      .min(0, "Cabin price should be greater than 0")
      .optional(),
    image: z
      .instanceof(File, { message: "Image is required" })
      .refine(
        (file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type) &&
          file.size <= MAX_FILE_SIZE,
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .optional(),
    observations: z.string().optional(),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "End date must be after start date",
    path: ["endDate"], // This attaches the error to the 'endDate' field
  })

  .refine(
    async (data) => {
      const count = await prisma.booking.count({
        where: {
          cabinId: data.cabinId,
          // Exclude cancelled bookings so they don't block dates
          status: { not: BookingStatus.CANCELLED },
          AND: [
            { checkInDate: { lt: data.checkOutDate } },
            { checkOutDate: { gt: data.checkInDate } },
          ],
        },
      });
      return count === 0;
    },
    {
      message: "This cabin is already booked for the selected dates.",
      path: ["cabinId"], // Attach error to the start date field
    }
  );
