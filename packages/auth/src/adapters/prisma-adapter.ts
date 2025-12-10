// ============================================================
// @ottabase/auth - Prisma D1 Auth.js Adapter
// ============================================================
//
// Prisma-specific Auth.js adapter for Cloudflare D1
// Uses @ottabase/cf/d1-prisma for Prisma client creation
//
// ⚠️ LEGACY: Drizzle adapter is recommended for D1
//
// ============================================================

import type { Adapter } from "@auth/core/adapters";
import type { D1Database } from "@cloudflare/workers-types";
import {
  createPrismaD1Client,
  getPrismaD1Client,
} from "@ottabase/cf/d1-prisma";

/**
 * Options for creating a Prisma D1 Auth.js adapter
 */
export interface PrismaD1AuthAdapterOptions {
  /**
   * Enable query logging
   * - `true`: Enable all log levels
   * - `false`: Disable logging
   * - Array: Specific log levels to enable
   */
  log?: boolean | ("query" | "info" | "warn" | "error")[];
}

/**
 * Create an Auth.js adapter for Cloudflare D1 using Prisma
 *
 * ⚠️ LEGACY: For new projects, use the Drizzle adapter instead.
 * The Drizzle adapter is better optimized for Cloudflare D1.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * import { createPrismaD1AuthAdapter } from "@ottabase/auth/adapters/prisma";
 *
 * export const authConfig = {
 *   adapter: createPrismaD1AuthAdapter(env.OBCF_D1),
 *   providers: [
 *     // Your providers
 *   ],
 * };
 * ```
 *
 * @example
 * ```typescript
 * // With logging enabled
 * const adapter = createPrismaD1AuthAdapter(env.OBCF_D1, {
 *   log: ["query", "error"]
 * });
 * ```
 */
export function createPrismaD1AuthAdapter(
  d1: D1Database,
  options: PrismaD1AuthAdapterOptions = {},
): Adapter {
  // Create Prisma client using the shared @ottabase/cf integration
  const prisma = createPrismaD1Client(d1, options);

  // Lazy load the PrismaAdapter to avoid bundling it if not needed
  let PrismaAdapter: any;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapterModule = require("@auth/prisma-adapter");
    PrismaAdapter = adapterModule.PrismaAdapter;
  } catch (error) {
    throw new Error(
      "@auth/prisma-adapter is not installed. Install with: pnpm add @auth/prisma-adapter",
    );
  }

  // Return the Auth.js PrismaAdapter configured with our D1 client
  return PrismaAdapter(prisma);
}

/**
 * Create a cached Prisma D1 Auth.js adapter
 *
 * Uses caching to avoid creating multiple Prisma clients for the
 * same D1 binding. Recommended for production use with Prisma.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * import { createPrismaD1AuthAdapterCached } from "@ottabase/auth/adapters/prisma";
 *
 * export const authConfig = {
 *   adapter: createPrismaD1AuthAdapterCached(env.OBCF_D1),
 *   providers: [
 *     // Your providers
 *   ],
 * };
 * ```
 */
export function createPrismaD1AuthAdapterCached(
  d1: D1Database,
  options: PrismaD1AuthAdapterOptions = {},
): Adapter {
  // Use the cached client factory from @ottabase/cf
  const prisma = getPrismaD1Client(d1, options);

  // Lazy load the PrismaAdapter
  let PrismaAdapter: any;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapterModule = require("@auth/prisma-adapter");
    PrismaAdapter = adapterModule.PrismaAdapter;
  } catch (error) {
    throw new Error(
      "@auth/prisma-adapter is not installed. Install with: pnpm add @auth/prisma-adapter",
    );
  }

  return PrismaAdapter(prisma);
}
