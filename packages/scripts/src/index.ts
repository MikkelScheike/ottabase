export { concatenatePrismaSchema } from "./concatenate";

// Re-export types from @ottabase/db for backward compatibility
export type {
  CoreSchemaName,
  PrismaConfig,
  PrismaProvider,
} from "@ottabase/db/prisma";

export { definePrismaConfig } from "@ottabase/db/prisma";
