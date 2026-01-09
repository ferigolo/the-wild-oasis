import { PrismaPg } from "@prisma/adapter-pg";
import { BookingStatus } from "./generated/enums";
import { PrismaClient } from "./generated/client";

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});

const prisma = new PrismaClient({
  log: ["info", "warn"],
  adapter,
});

// ==========================================
// 1. Data Definitions
// ==========================================

const cabins = [
  {
    name: "001",
    maxCapacity: 2,
    regularPrice: 250,
    discount: 0,
    image:
      "https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/cabin-images/cabin-001.jpg",
    description: "A cozy small cabin in the woods.",
  },
  {
    name: "002",
    maxCapacity: 2,
    regularPrice: 350,
    discount: 25,
    image:
      "https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/cabin-images/cabin-002.jpg",
    description: "Luxury cabin for romantic getaways.",
  },
  {
    name: "003",
    maxCapacity: 4,
    regularPrice: 300,
    discount: 0,
    image:
      "https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/cabin-images/cabin-003.jpg",
    description: "Perfect for small families.",
  },
  {
    name: "004",
    maxCapacity: 6,
    regularPrice: 500,
    discount: 50,
    image:
      "https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/cabin-images/cabin-004.jpg",
    description: "Large cabin with a beautiful view.",
  },
];

const guests = [
  {
    fullName: "Jonas Schmedtmann",
    email: "jonas@example.com",
    nationality: "Portugal",
    nationalId: 3525436345,
    countryFlag: "https://flagcdn.com/pt.svg",
  },
  {
    fullName: "Alice Smith",
    email: "alice@example.com",
    nationality: "United Kingdom",
    nationalId: 4534593454,
    countryFlag: "https://flagcdn.com/gb.svg",
  },
  {
    fullName: "Mohammed Ali",
    email: "mohammed@example.com",
    nationality: "Egypt",
    nationalId: 6332454532,
    countryFlag: "https://flagcdn.com/eg.svg",
  },
  {
    fullName: "Maria Rodriguez",
    email: "maria@example.com",
    nationality: "Spain",
    nationalId: 9875463421,
    countryFlag: "https://flagcdn.com/es.svg",
  },
];

// ==========================================
// 2. Helper Functions
// ==========================================

// Helper to pick a random item from an array
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a random date within the last 6 months or next 3 months
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Clean the database (Order matters due to foreign keys!)
  // Delete Bookings first because they depend on Guests and Cabins
  await Promise.all([
    prisma.booking.deleteMany(),
    prisma.guest.deleteMany(),
    prisma.cabin.deleteMany(),
    prisma.settings.deleteMany(),
  ]);

  console.log("🧹 Database cleaned");

  // 2. Create Settings
  await prisma.settings.create({
    data: {
      minBookingLength: 3,
      maxBookingLength: 30,
      maxGuestsPerBooking: 10,
      breakfastPrice: 15,
    },
  });

  // 3. Create Cabins
  // We use createMany but then need to fetch them back to get their IDs
  // simpler for seeding is to just loop create or use createMany and fetch all
  await Promise.all([
    prisma.cabin.createMany({ data: cabins }),
    prisma.guest.createMany({ data: guests }),
  ]);

  const [allCabins, allGuests] = await Promise.all([
    prisma.cabin.findMany({}),
    prisma.guest.findMany(),
  ]);

  console.log(
    `✅ Created ${allCabins.length} cabins and ${allGuests.length} guests`
  );

  // 5. Create Random Bookings
  // We will create 10 random bookings
  const bookingsData = [];

  for (let i = 0; i < 10; i++) {
    const guest = random(allGuests);
    const cabin = random(allCabins);

    // Random check-in between 1 month ago and 2 months from now
    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
    const twoMonthsFromNow = new Date(today.setMonth(today.getMonth() + 3));

    const checkIn = randomDate(oneMonthAgo, twoMonthsFromNow);
    const stayDuration = Math.floor(Math.random() * 7) + 2; // 2 to 9 days
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + stayDuration);

    const hasBreakfast = Math.random() > 0.5;
    const cabinPrice = cabin.regularPrice * stayDuration;
    const extrasPrice = hasBreakfast
      ? 15 * stayDuration * cabin.maxCapacity
      : 0; // Simplified logic

    bookingsData.push({
      guestId: guest.id,
      cabinId: cabin.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: Math.floor(Math.random() * cabin.maxCapacity) + 1,
      hasBreakfast,
      cabinPrice,
      extrasPrice,
      status: random(Object.values(BookingStatus)),
      isPaid: Math.random() > 0.2, // 80% chance of being paid
      observations: Math.random() > 0.7 ? "Allergic to nuts" : null,
    });
  }

  await prisma.booking.createMany({ data: bookingsData });
  console.log(`✅ Created ${bookingsData.length} random bookings`);

  console.log("🌿 Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
