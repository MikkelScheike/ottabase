// ============================================================
// @ottabase/auth - Feature Registration
// ============================================================

import { defineFeatureSchema, registerFeature } from "@ottabase/db/registry";

/**
 * Auth feature schema definition for Drizzle (default)
 *
 * Auth tables are integrated into OttaORM core migrations:
 * - 001_create_users_table
 * - 002_create_accounts_table
 * - 006_create_sessions_table
 * - 007_create_verification_tokens_table
 * - 008_create_authenticators_table
 *
 * No separate schema files needed - migrations are managed by OttaORM.
 */
export const authFeatureDrizzle = defineFeatureSchema({
  featureId: "auth",
  name: "Authentication (Drizzle)",
  description:
    "Auth.js (NextAuth.js) compatible authentication models for Drizzle + D1",
  packageName: "@ottabase/auth",
  schemaPath: "", // Empty - using OttaORM migrations
  dependencies: ["@ottabase/ottaorm"], // Requires OttaORM for migrations
  version: "1.0.0",
});

/**
 * Auth feature schema definition for Prisma (legacy)
 *
 * @deprecated Drizzle is recommended for D1. Use authFeatureDrizzle instead.
 */
export const authFeaturePrisma = defineFeatureSchema({
  featureId: "auth-prisma",
  name: "Authentication (Prisma)",
  description:
    "Auth.js (NextAuth.js) compatible authentication models for Prisma",
  packageName: "@ottabase/auth",
  schemaPath: "prisma/auth.schema.prisma",
  dependencies: [], // No dependencies, but extends User model from base
  version: "1.0.0",
});

/**
 * Default auth feature (Drizzle)
 */
export const authFeature = authFeatureDrizzle;

/**
 * Register the auth feature with the global registry
 *
 * @param orm - ORM to use ("drizzle" or "prisma"), defaults to "drizzle"
 */
export function registerAuthFeature(
  orm: "drizzle" | "prisma" = "drizzle",
): void {
  const feature = orm === "drizzle" ? authFeatureDrizzle : authFeaturePrisma;
  registerFeature(feature);
}

// Auto-register Drizzle feature by default
registerAuthFeature();
