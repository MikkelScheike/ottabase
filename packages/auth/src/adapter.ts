// ============================================================
// @ottabase/auth - D1 Auth.js Adapter
// ============================================================
//
// Provides a D1-compatible adapter for Auth.js using the
// @ottabase/cf package for Prisma D1 client creation.
//
// ============================================================

import type { D1Database } from "@cloudflare/workers-types";
import type { Adapter } from "@auth/core/adapters";
import { createPrismaD1Client } from "@ottabase/cf/d1-prisma";

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
}

/**
 * Create an Auth.js adapter for Cloudflare D1
 *
 * This adapter bridges Auth.js with Cloudflare D1 using the
 * @ottabase/cf package for consistent D1 client creation across
 * all Ottabase applications.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * // In your Auth.js configuration
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
 * // With logging enabled
 * const adapter = createD1AuthAdapter(env.DB, { log: ["query", "error"] });
 * ```
 */
export function createD1AuthAdapter(
  d1: D1Database,
  options: D1AuthAdapterOptions = {},
): Adapter {
  // Create Prisma client using the shared @ottabase/cf integration
  // This ensures consistent D1 client creation across all Ottabase apps
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
 * Create a cached D1 Auth.js adapter
 *
 * This version uses the cached D1 client from @ottabase/cf
 * to avoid creating multiple clients for the same D1 binding.
 *
 * Recommended for use in request handlers where the same
 * D1 binding might be accessed multiple times.
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
 */
export function createD1AuthAdapterCached(
  d1: D1Database,
  options: D1AuthAdapterOptions = {},
): Adapter {
  // Use the cached client factory from @ottabase/cf
  const { getPrismaD1Client } = require("@ottabase/cf/d1-prisma");
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
