import { z } from "zod";
import { prisma } from "./prisma";
import { BookingStatus } from "@/prisma/generated/enums";

export const BookingCreateSchema = z
  .object({
    guestId: z.coerce
      .number()
      .min(1, "Guest ID is missing")
      .refine(
        async (guestId) =>
          (await prisma.guest.count({
            where: { id: guestId },
          })) > 0,
        {
          message: "Guest with this ID not found",
        }
      ),
    cabinId: z.coerce
      .number()
      .min(1, "Cabin ID is missing")
      .refine(
        async (cabinId) =>
          (await prisma.cabin.count({
            where: { id: cabinId },
          })) > 0,
        {
          message: "Cabin with this ID not found",
        }
      ),
    hasBreakfast: z.coerce.boolean().default(false),
    checkInDate: z.coerce
      .date()
      .min(new Date(), { message: "Checkin date must be greater than today" }),
    checkOutDate: z.coerce.date(),
    observations: z.string().optional(),
    numberOfGuests: z.coerce.number().min(1),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "End date must be after start date",
    path: ["endDate"], // This attaches the error to the 'endDate' field
  })
  .refine(
    async (data) =>
      (await prisma.booking.count({
        where: {
          cabinId: data.cabinId,
          // Exclude cancelled bookings so they don't block dates
          status: { not: BookingStatus.CANCELLED },
          AND: [
            { checkInDate: { gte: data.checkInDate } },
            { checkOutDate: { lte: data.checkOutDate } },
          ],
        },
      })) == 0,
    {
      message: "This cabin is already booked for the selected dates.",
      path: ["cabinId"], // Attach error to the start date field
    }
  )
  .transform(async (data) => {
    const { regularPrice, discount } = await prisma.cabin.findUniqueOrThrow({
      where: { id: data.cabinId },
      select: { regularPrice: true, discount: true },
    });
    data.checkInDate.setUTCHours(0, 0, 0, 0);
    data.checkOutDate.setUTCHours(23, 59, 59, 0);
    return {
      ...data,
      cabinPrice: regularPrice,
      extrasPrice: -discount,
    };
  });

export const BookingUpdateSchema = z
  .object({
    cabinId: z.coerce.number().min(1),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    observations: z.string().optional(),
    numberOfGuests: z.coerce.number().min(1),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "End date must be after start date",
    path: ["endDate"], // This attaches the error to the 'endDate' field
  })
  .refine(
    async (data) =>
      (await prisma.booking.count({
        where: {
          cabinId: data.cabinId,
          // Exclude cancelled bookings so they don't block dates
          status: { not: BookingStatus.CANCELLED },
          AND: [
            { checkInDate: { gte: data.checkInDate } },
            { checkOutDate: { lte: data.checkOutDate } },
          ],
        },
      })) == 0,
    {
      message: "This cabin is already booked for the selected dates.",
      path: ["cabinId"], // Attach error to the start date field
    }
  )
  .transform(async (data) => {
    const { regularPrice, discount } = await prisma.cabin.findUniqueOrThrow({
      where: { id: data.cabinId },
      select: { regularPrice: true, discount: true },
    });
    data.checkInDate.setHours(0, 0, 0, 0);
    data.checkOutDate.setHours(23, 59, 59, 0);
    return {
      ...data,
      cabinPrice: regularPrice,
      extrasPrice: -discount,
    };
  });

export const GuestSchema = z.object({
  fullName: z.coerce.string().refine((fullname) => fullname.trim(), {
    message: "Client's full name is required",
  }),
  email: z.email({ message: "Must be a valid email" }),
  nationality: z.string().trim().optional(),
  nationalId: z
    .string()
    .regex(/^[a-zA-Z0-9]{6,12}$/, "Invalid national Id number")
    .transform(Number)
    .optional(),
  countryFlag: z.string().length(2).optional(),
});
