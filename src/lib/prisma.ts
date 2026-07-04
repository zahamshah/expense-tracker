import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/prisma-client/client";

const fallbackUrl =
  "postgresql://postgres:postgres@localhost:5432/warehouse_expenses?schema=public";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? fallbackUrl,
    max: 5,
  });

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
}

export { prisma };
