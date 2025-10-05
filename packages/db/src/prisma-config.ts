export type { CoreSchemaName } from "../prisma/schemas";

export type PrismaProvider =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "sqlserver"
  | "mongodb"
  | "cockroachdb";

export interface PrismaConfig {
  /**
   * Array of core schema names to include from @ottabase/db/prisma/schemas/
   * Example: ["user", "post"]
   */
  coreSchemas?: import("../prisma/schemas").CoreSchemaName[];

  /**
   * Database provider to use in the generated schema
   * Defaults to "postgresql" if not specified
   */
  provider?: PrismaProvider;

  /**
   * Path to the app-specific schema file (relative to app root)
   * Defaults to "ottabase/prisma/app.schema.prisma"
   */
  appSchemaPath?: string;

  /**
   * Path where the concatenated schema will be written (relative to app root)
   * Defaults to "prisma/schema.prisma"
   */
  outputSchemaPath?: string;

  /**
   * Prisma generate configuration
   */
  prismaGenerate?: {
    enabled?: boolean;
  };
}

export const definePrismaConfig = (config: PrismaConfig): PrismaConfig =>
  config;
