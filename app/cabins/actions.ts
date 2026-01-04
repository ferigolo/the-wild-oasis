import { bookingSchema } from "@/app/_lib/schemas";
import { redirect } from "next/navigation";
import { uploadCabinImage } from "@/app/_services/storageService";
import { Prisma } from "@/prisma/generated/client";
import { prisma } from "../_lib/prisma";
import { CabinSelect } from "@/prisma/generated/models";

export async function getCabins(
  select: Prisma.CabinSelect = {
    id: true,
    name: true,
    description: true,
    maxCapacity: true,
    regularPrice: true,
    discount: true,
    image: true,
  },
  where: Prisma.CabinWhereInput = {}
) {
  return await prisma.cabin.findMany({
    select,
    where,
  });
}

export async function getCabin(id: number, select?: CabinSelect) {
  return await prisma.cabin.findUnique({ where: { id: Number(id) }, select });
}

export async function createBookingAction(formData: FormData) {
  const rawData = {
    cabinId: formData.get("cabinId"),
    checkInData: formData.get("startDate"),
    checkOutData: formData.get("endDate"),
    hasBreakfast: formData.get("hasBreakfast"),
    extrasPrice: formData.get("extrasPrice"),
    isPaid: formData.get("isPaid"),
    observations: formData.get("observations"),
    image: formData.get("image"), // This is a File object
  };

  const result = bookingSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      error: result.error.flatten().fieldErrors, // { startDate: ["Invalid date"], endDate: ["End date must be after..."] }
    };
  }

  let { cabinPrice, cabinId, image } = result.data;
  let imageUrl = "";

  if (image && image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadCabinImage(image);
    } catch (error) {
      return {
        success: false,
        message: "Image upload failed",
        error,
      };
    }
  }

  if (!cabinPrice)
    cabinPrice = (
      await prisma.cabin.findUniqueOrThrow({
        where: { id: cabinId },
        select: { regularPrice: true },
      })
    ).regularPrice;

  try {
    await prisma.booking.create({
      data: { ...result.data, cabinPrice, image: imageUrl },
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
  redirect("/account/reservations");
}
