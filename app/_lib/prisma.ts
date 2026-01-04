import { PrismaClient } from "@/prisma/generated/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

// Add prisma to the NodeJS global type
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prevent multiple instances during hot-reloading
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["info", "warn"],
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
