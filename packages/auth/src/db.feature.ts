// ============================================================
// @ottabase/auth - Feature Registration
// ============================================================

import { defineFeatureSchema, registerFeature } from "@ottabase/db/registry";

/**
 * Auth feature schema definition
 */
export const authFeature = defineFeatureSchema({
  featureId: "auth",
  name: "Authentication",
  description: "Auth.js (NextAuth.js) compatible authentication models",
  packageName: "@ottabase/auth",
  schemaPath: "prisma/auth.schema.prisma",
  // Migrations are auto-generated from schema via `pnpm db:migrate`
  dependencies: [], // No dependencies, but requires User model from base
  version: "1.0.0",
});

/**
 * Register the auth feature with the global registry
 */
export function registerAuthFeature(): void {
  registerFeature(authFeature);
}

// Auto-register when imported
registerAuthFeature();
