// ============================================================
// @ottabase/ottaorm - Global Context for Driver Management
// ============================================================
//
// This provides Eloquent-like syntax by managing the driver globally
// Usage: setDriver(driver) once, then use models without passing driver
// ============================================================

import type { DbDriver } from "@ottabase/db/drizzle";

let globalDriver: DbDriver | null = null;

/**
 * Set the global database driver
 * Call this once at app startup (e.g., in middleware or app init)
 *
 * @example
 * ```typescript
 * import { setDriver } from "@ottabase/ottaorm";
 * import { createD1Driver } from "@ottabase/db/drizzle-d1";
 *
 * // In your Cloudflare Worker or Next.js middleware
 * setDriver(createD1Driver(env.DB));
 * ```
 */
export function setDriver(driver: DbDriver): void {
  globalDriver = driver;
}

/**
 * Get the global database driver
 * Throws an error if driver hasn't been set
 */
export function getDriver(): DbDriver {
  if (!globalDriver) {
    throw new Error(
      "Database driver not initialized. Call setDriver() before using models.\n" +
      "Example: setDriver(createD1Driver(env.DB))"
    );
  }
  return globalDriver;
}

/**
 * Clear the global driver (useful for testing)
 */
export function clearDriver(): void {
  globalDriver = null;
}

/**
 * Check if driver is set
 */
export function hasDriver(): boolean {
  return globalDriver !== null;
}
