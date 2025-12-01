// ============================================================
// @ottabase/db - Shared Database Package
// ============================================================
//
// This package provides a unified database layer for Ottabase applications.
// It handles Prisma schema configuration, feature registry, and client setup.
//
// For Cloudflare D1 integration, use @ottabase/cf/prisma-d1:
//   import { createPrismaD1Client } from "@ottabase/cf/prisma-d1";
//
// For schema configuration:
//   import { defineAppDbConfig } from "@ottabase/db";
//
// ============================================================

// Re-export Prisma client and types
export * from "@prisma/client";
export type { PrismaClient } from "@prisma/client";

// Configuration types and helpers
export type {
  AppDbConfig,
  CoreSchemaName,
  CreateClientOptions,
  DbProvider,
  FeatureId,
  FeatureRegistry,
  FeatureSchemaDefinition,
  GeneratorConfig,
  MigrationConfig,
  ResolvedAppDbConfig,
} from "./config";

export {
  defineAppDbConfig,
  defineFeatureSchema,
  resolveAppDbConfig,
} from "./config";

// Feature registry
export {
  createFeatureRegistry,
  discoverFeatures,
  getFeatureRegistry,
  registerFeature,
  resetFeatureRegistry,
} from "./registry";

// Base Prisma client (for non-D1 usage / development)
export { prisma } from "./client";
