import { PrismaClient } from "@prisma/client";
import { mockPrisma } from "./mock-db";

// Detect if a live Postgres connection is provided or if we should run in in-memory Mock Data mode
const hasRealDb = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("[password]") &&
  !process.env.DATABASE_URL.includes("[project-ref]") &&
  process.env.USE_MOCK_DATA !== "true"
);

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: PrismaClient = (
  hasRealDb
    ? (globalForPrisma.prisma ??
       new PrismaClient({
         log: process.env.NODE_ENV === "development" ? ["query"] : [],
       }))
    : (mockPrisma as unknown as PrismaClient)
);

if (process.env.NODE_ENV !== "production" && hasRealDb) {
  globalForPrisma.prisma = prisma;
}
