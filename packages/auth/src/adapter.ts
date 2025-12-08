// ============================================================
// @ottabase/auth - D1 Auth.js Adapter Factory
// ============================================================
//
// ORM-agnostic adapter factory for Auth.js with Cloudflare D1
// Delegates to ORM-specific implementations:
// - Drizzle adapter (recommended, default) → adapters/drizzle-adapter.ts
// - Prisma adapter (legacy) → adapters/prisma-adapter.ts
//
// ============================================================

import type { Adapter } from "@auth/core/adapters";
import type { D1Database } from "@cloudflare/workers-types";
import {
  createDrizzleD1AuthAdapter as createDrizzleAdapter,
  createDrizzleD1AuthAdapterCached as createDrizzleAdapterCached,
} from "./adapters/drizzle-adapter";
import {
  createPrismaD1AuthAdapter as createPrismaAdapter,
  createPrismaD1AuthAdapterCached as createPrismaAdapterCached,
} from "./adapters/prisma-adapter";

/**
 * Supported ORM types for Auth.js adapters
 */
export type AuthORM = "prisma" | "drizzle";

/**
 * Options for creating a D1 Auth.js adapter
 */
export interface D1AuthAdapterOptions {
  /**
   * Enable query logging
   * - `true`: Enable all log levels
   * - `false`: Disable logging
   * - Array: Specific log levels to enable
   */
  log?: boolean | ("query" | "info" | "warn" | "error")[];

  /**
   * ORM to use for the adapter
   * - "prisma": Use Prisma ORM (requires @auth/prisma-adapter)
   * - "drizzle": Use Drizzle ORM (custom implementation)
   *
   * @default "drizzle"
   */
  orm?: AuthORM;
}

/**
 * Create an Auth.js adapter for Cloudflare D1
 *
 * Supports both Prisma and Drizzle ORMs. Drizzle is the default
 * and recommended ORM for Cloudflare D1 due to better edge compatibility.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * // Using Drizzle (default, recommended)
 * import { createD1AuthAdapter } from "@ottabase/auth/adapter";
 *
 * export const { handlers, auth } = NextAuth({
 *   adapter: createD1AuthAdapter(env.DB),
 *   providers: [
 *     // Your providers
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using Prisma explicitly
 * const adapter = createD1AuthAdapter(env.DB, { orm: "prisma" });
 * ```
 *
 * @example
 * ```typescript
 * // With logging enabled
 * const adapter = createD1AuthAdapter(env.DB, {
 *   orm: "drizzle",
 *   log: ["query", "error"]
 * });
 * ```
 */
export function createD1AuthAdapter(
  d1: D1Database,
  options: D1AuthAdapterOptions = {},
): Adapter {
  const { orm = "drizzle", ...adapterOptions } = options;

  // Delegate to ORM-specific adapter
  if (orm === "drizzle") {
    return createDrizzleAdapter(d1, adapterOptions);
  }

  // Prisma adapter (legacy)
  return createPrismaAdapter(d1, adapterOptions);
}

/**
 * Create a cached D1 Auth.js adapter
 *
 * Uses caching to avoid creating multiple adapters/clients for the
 * same D1 binding. Recommended for production use.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * import { createD1AuthAdapterCached } from "@ottabase/auth/adapter";
 *
 * export const { handlers, auth } = NextAuth({
 *   adapter: createD1AuthAdapterCached(env.DB),
 *   providers: [
 *     // Your providers
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using Prisma with caching
 * const adapter = createD1AuthAdapterCached(env.DB, { orm: "prisma" });
 * ```
 */
export function createD1AuthAdapterCached(
  d1: D1Database,
  options: D1AuthAdapterOptions = {},
): Adapter {
  const { orm = "drizzle", ...adapterOptions } = options;

  // Delegate to ORM-specific cached adapter
  if (orm === "drizzle") {
    return createDrizzleAdapterCached(d1, adapterOptions);
  }

  // Prisma adapter (legacy)
  return createPrismaAdapterCached(d1, adapterOptions);
}

// ============================================================
// CONVENIENCE RE-EXPORTS FOR SPECIFIC ORMs
// ============================================================

// Drizzle adapter (recommended for D1)
export {
    createDrizzleD1AuthAdapter,
    createDrizzleD1AuthAdapterCached,
    type DrizzleD1AuthAdapterOptions
} from "./adapters/drizzle-adapter";

// Prisma adapter (legacy)
export {
    createPrismaD1AuthAdapter,
    createPrismaD1AuthAdapterCached,
    type PrismaD1AuthAdapterOptions
} from "./adapters/prisma-adapter";

