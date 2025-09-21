import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __ottabase_prisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__ottabase_prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ottabase_prisma__ = prisma;
}
