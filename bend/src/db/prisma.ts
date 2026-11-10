import "../env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const cache = globalThis as typeof globalThis & { restyPrisma?: PrismaClient };

export const prisma = cache.restyPrisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
if (process.env.NODE_ENV !== "production") cache.restyPrisma = prisma;
