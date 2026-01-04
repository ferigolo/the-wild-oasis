import { getCabin } from "@/app/cabins/actions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const cabin = await getCabin((await params).id, {
    id: true,
    name: true,
    maxCapacity: true,
    description: true,
    regularPrice: true,
    discount: true,
    bookings: {
      select: {
        id: true,
        numberOfGuests: true,
        hasBreakfast: true,
        status: true,
        observations: true,
      },
    },
  });
  return NextResponse.json(cabin, { status: cabin ? 200 : 404 });
}
