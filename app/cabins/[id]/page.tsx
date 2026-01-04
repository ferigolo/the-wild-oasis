import Reservation from "@/app/cabins/components/Reservation";
import Spinner from "@/app/_components/Spinner";
import TextExpander from "@/app/_components/TextExpander";
import { Cabin as CabinModel } from "@/prisma/generated/client";
import { EyeOff, MapPin, Users } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCabin, getCabins } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  try {
    const { name, description } = await getCabin(Number((await params).id));
    return { title: `Cabin ${name}`, description };
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  const cabins = await getCabins({ id: true });
  return cabins.map((cabin) => ({
    id: String(cabin.id),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const cabin = await getCabin(id);
  if (!cabin) notFound();
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <Cabin cabin={cabin}></Cabin>
      <div>
        <h2 className="text-3xl font-semibold text-center mb-10 text-accent-400">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>
        <Suspense fallback={<Spinner></Spinner>}>
          <Reservation cabin={cabin}></Reservation>
        </Suspense>
      </div>
    </div>
  );
}

async function Cabin({ cabin }: { cabin: CabinModel }) {
  const { image, name, description, maxCapacity } = cabin;
  return (
    <div className="grid grid-cols-[3fr_4fr] gap-20 border border-primary-800 py-3 px-10 mb-24">
      {image && (
        <div className="relative scale-[1.15]">
          <Image
            src={image}
            fill
            className="object-cover"
            alt={`Cabin ${name}`}
          />
        </div>
      )}
      <div>
        <h3 className="text-accent-100 font-black text-7xl mb-5 -translate-x-63.5 bg-primary-950 p-6 pb-1 w-[150%]">
          Cabin {name}
        </h3>

        <p className="text-lg text-primary-300 mb-10">
          <TextExpander>{description}</TextExpander>
        </p>
        <ul className="flex flex-col gap-4 mb-7">
          <li className="flex gap-3 items-center">
            <Users className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              For up to <span className="font-bold">{maxCapacity}</span> guests
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <MapPin className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              Located in the heart of the{" "}
              <span className="font-bold">Dolomites</span> (Italy)
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <EyeOff className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              Privacy <span className="font-bold">100%</span> guaranteed
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
