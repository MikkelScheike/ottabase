// ============================================================
// @ottabase/scripts - Utility Scripts for Ottabase Monorepo
// ============================================================

// Schema concatenation
export {
  concatenateAppSchema,
  type ConcatenateOptions,
  type ConcatenateResult,
} from "./schema/concatenate";

// Migrations
export {
  discoverMigrations,
  generateMigrationPlan,
  createCombinedMigration,
  runD1Migrations,
  getAppliedMigrations,
  type MigrationFile,
  type MigrationResult,
  type DiscoverMigrationsOptions,
  type RunMigrationsOptions,
} from "./migrations/runner";

// Re-export types from @ottabase/db for convenience
export type {
  AppDbConfig,
  DbProvider,
  FeatureId,
  FeatureSchemaDefinition,
} from "@ottabase/db/config";

export { defineAppDbConfig, defineFeatureSchema } from "@ottabase/db/config";
