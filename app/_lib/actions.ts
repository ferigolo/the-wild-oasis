"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { prisma } from "./prisma";
import z from "zod";
import {
  BookingCreateSchema,
  BookingUpdateSchema,
  GuestSchema,
} from "./schemas";
import { User } from "next-auth";
import { redirect } from "next/navigation";

async function validateUser(id: number) {
  const session = await auth();
  if (!session) throw new Error("User must be logged in");
  const { guestId } = await prisma.booking.findUniqueOrThrow({
    where: { id },
    select: { guestId: true },
  });
  return { user: session.user, guestId };
}

function validadePermission(guestId: number, user?: User) {
  if (user?.guestId != guestId)
    throw new Error("User not authorized to make this action");
}

export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("User must be logged in");
  const { success, error, data } = await BookingCreateSchema.safeParseAsync({
    ...Object.fromEntries(formData.entries()),
    guestId: session.user?.guestId,
  });
  if (!success) throw new Error(JSON.stringify(error.flatten().fieldErrors));
  const { id } = await prisma.booking.create({ data });
  revalidatePath(`/account/reservation/${id}`);
  revalidatePath("/account/reservation");
  redirect("/account/reservations");
}

export async function updateReservation(formData: FormData) {
  const { user, guestId } = await validateUser(
    Number(formData.get("bookingId"))
  );
  validadePermission(guestId, user);
  const { success, error, data } = await BookingUpdateSchema.safeParseAsync(
    Object.fromEntries(formData.entries())
  );
  if (!success) throw new Error(JSON.stringify(z.treeifyError(error).errors));
  await prisma.booking.update({
    where: { id: Number(formData.get("bookingId")) },
    data,
  });
  revalidatePath(`/account/reservation/${formData.get("bookingId")}`);
  revalidatePath("/account/reservation");
  redirect("/account/reservations");
}

export async function deleteReservation(id: number) {
  const { user, guestId } = await validateUser(id);
  validadePermission(guestId, user);
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/account/reservation");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuest(formData: FormData) {
  const { user, guestId } = await validateUser(Number(formData.get("guestId")));
  validadePermission(guestId, user);
  const { success, error, data } = GuestSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!success) throw new Error(JSON.stringify(error.flatten().fieldErrors));
  await prisma.guest.update({
    where: { id: user?.guestId },
    data,
  });
  revalidatePath("/account/profile"); // revalidates the cached data
}
