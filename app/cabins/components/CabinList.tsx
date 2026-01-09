import { FilterTypes } from "@/types";
import CabinCard from "./CabinCard";
import { getCabins } from "@/app/_services/data-service";

function getNumberRange(filter: FilterTypes) {
  if (filter == "large") return { gte: 8 };
  if (filter == "medium") return { gte: 4, lte: 7 };
  if (filter == "small") return { gte: 1, lte: 3 };
  return undefined;
}

export default async function CabinList({ filter }: { filter: FilterTypes }) {
  const cabins = await getCabins(
    {
      id: true,
      name: true,
      description: true,
      maxCapacity: true,
      regularPrice: true,
      discount: true,
      image: true,
    },
    {
      maxCapacity: getNumberRange(filter),
    }
  );
  if (!cabins.length) return null;
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {cabins.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  );
}
