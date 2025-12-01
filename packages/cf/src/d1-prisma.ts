/**
 * D1 Prisma Adapter Integration
 * Creates Prisma clients configured for Cloudflare D1
 *
 * This module bridges @ottabase/cf (Cloudflare bindings) with @ottabase/db (Prisma ORM).
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1
 */

import type { D1Database } from "@cloudflare/workers-types";
import { CloudflareError } from "./types";

// ============================================================
// TYPES
// ============================================================

/**
 * Options for creating a Prisma D1 client
 */
export interface PrismaD1ClientOptions {
  /**
   * Enable query logging
   * - `true`: Enable all log levels
   * - `false`: Disable logging
   * - Array: Specific log levels to enable
   */
  log?: boolean | ("query" | "info" | "warn" | "error")[];
}

/**
 * Generic PrismaClient type (to avoid direct dependency on @prisma/client)
 * The actual type will be inferred from the app's generated Prisma client
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PrismaClientType = any;

// ============================================================
// DYNAMIC IMPORTS
// ============================================================

// Dynamic import for the D1 adapter (peer dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaD1Adapter: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientClass: any;

/**
 * Initialize Prisma dependencies
 * Called lazily when first client is created
 */
async function initPrismaDependencies(): Promise<void> {
  if (PrismaD1Adapter && PrismaClientClass) return;

  try {
    const adapterModule = await import("@prisma/adapter-d1");
    PrismaD1Adapter = adapterModule.PrismaD1;
  } catch {
    throw new CloudflareError(
      "@prisma/adapter-d1 is not installed. Install with: pnpm add @prisma/adapter-d1",
      "PRISMA_ADAPTER_MISSING",
    );
  }

  try {
    const clientModule = await import("@prisma/client");
    PrismaClientClass = clientModule.PrismaClient;
  } catch {
    throw new CloudflareError(
      "@prisma/client is not installed. Install with: pnpm add @prisma/client",
      "PRISMA_CLIENT_MISSING",
    );
  }
}

/**
 * Synchronous initialization (for CommonJS compatibility)
 */
function initPrismaDependenciesSync(): void {
  if (PrismaD1Adapter && PrismaClientClass) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    PrismaD1Adapter = require("@prisma/adapter-d1").PrismaD1;
  } catch {
    throw new CloudflareError(
      "@prisma/adapter-d1 is not installed. Install with: pnpm add @prisma/adapter-d1",
      "PRISMA_ADAPTER_MISSING",
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    PrismaClientClass = require("@prisma/client").PrismaClient;
  } catch {
    throw new CloudflareError(
      "@prisma/client is not installed. Install with: pnpm add @prisma/client",
      "PRISMA_CLIENT_MISSING",
    );
  }
}

// ============================================================
// CLIENT FACTORY
// ============================================================

/**
 * Create a Prisma client configured for Cloudflare D1
 *
 * This is the primary way to create a database client in Cloudflare Workers.
 * The client is configured with the D1 adapter and ready to use.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the client
 * @returns A configured PrismaClient instance
 *
 * @example
 * ```typescript
 * // In a Cloudflare Worker
 * import { createPrismaD1Client } from "@ottabase/cf/d1-prisma";
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const prisma = createPrismaD1Client(env.DB);
 *     const users = await prisma.user.findMany();
 *     return Response.json(users);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With logging enabled
 * const prisma = createPrismaD1Client(env.DB, { log: true });
 *
 * // With specific log levels
 * const prisma = createPrismaD1Client(env.DB, { log: ["query", "error"] });
 * ```
 */
export function createPrismaD1Client<T = PrismaClientType>(
  d1: D1Database,
  options: PrismaD1ClientOptions = {},
): T {
  // Initialize dependencies synchronously
  initPrismaDependenciesSync();

  // Validate D1 binding
  if (!isD1Database(d1)) {
    throw new CloudflareError(
      "Invalid D1 database binding. Ensure the D1 binding is configured in wrangler.toml.",
      "D1_INVALID_BINDING",
    );
  }

  // Create the D1 adapter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaD1Adapter(d1 as any);

  // Configure logging
  const logConfig =
    options.log === true
      ? (["query", "info", "warn", "error"] as const)
      : options.log || [];

  // Create and return the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClientClass({
    adapter,
    log: logConfig.length > 0 ? [...logConfig] : undefined,
  } as any) as T;
}

/**
 * Create a Prisma D1 client asynchronously
 *
 * Use this when you need async initialization (e.g., in ESM modules).
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the client
 * @returns A Promise resolving to a configured PrismaClient instance
 */
export async function createPrismaD1ClientAsync<T = PrismaClientType>(
  d1: D1Database,
  options: PrismaD1ClientOptions = {},
): Promise<T> {
  // Initialize dependencies asynchronously
  await initPrismaDependencies();

  // Validate D1 binding
  if (!isD1Database(d1)) {
    throw new CloudflareError(
      "Invalid D1 database binding. Ensure the D1 binding is configured in wrangler.toml.",
      "D1_INVALID_BINDING",
    );
  }

  // Create the D1 adapter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaD1Adapter(d1 as any);

  // Configure logging
  const logConfig =
    options.log === true
      ? (["query", "info", "warn", "error"] as const)
      : options.log || [];

  // Create and return the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClientClass({
    adapter,
    log: logConfig.length > 0 ? [...logConfig] : undefined,
  } as any) as T;
}

// ============================================================
// SINGLETON PATTERN FOR WORKERS
// ============================================================

/**
 * Cache for reusing clients within the same request context
 *
 * Uses WeakMap to allow garbage collection when the D1 binding
 * is no longer referenced.
 */
const clientCache = new WeakMap<D1Database, PrismaClientType>();

/**
 * Get or create a Prisma D1 client (cached per D1 binding)
 *
 * This function caches clients per D1 binding to avoid creating
 * multiple client instances within the same request. This is useful
 * when you need to access the database from multiple places in your
 * request handler.
 *
 * Note: The cache uses WeakMap, so clients will be garbage collected
 * when the D1 binding is no longer referenced.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the client
 * @returns A cached or new PrismaClient instance
 *
 * @example
 * ```typescript
 * import { getPrismaD1Client } from "@ottabase/cf/d1-prisma";
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     // Same client instance will be returned for the same env.DB
 *     const prisma = getPrismaD1Client(env.DB);
 *
 *     // Use in multiple places
 *     const users = await getUsers(env.DB);
 *     const posts = await getPosts(env.DB);
 *
 *     return Response.json({ users, posts });
 *   }
 * }
 *
 * async function getUsers(db: D1Database) {
 *   const prisma = getPrismaD1Client(db); // Returns cached client
 *   return prisma.user.findMany();
 * }
 *
 * async function getPosts(db: D1Database) {
 *   const prisma = getPrismaD1Client(db); // Returns same cached client
 *   return prisma.post.findMany();
 * }
 * ```
 */
export function getPrismaD1Client<T = PrismaClientType>(
  d1: D1Database,
  options: PrismaD1ClientOptions = {},
): T {
  let client = clientCache.get(d1) as T | undefined;

  if (!client) {
    client = createPrismaD1Client<T>(d1, options);
    clientCache.set(d1, client);
  }

  return client;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if a value is a D1 database binding
 *
 * This is useful for runtime validation of environment bindings.
 *
 * @param value - The value to check
 * @returns True if the value appears to be a D1 database binding
 */
export function isD1Database(value: unknown): value is D1Database {
  return (
    typeof value === "object" &&
    value !== null &&
    "prepare" in value &&
    "batch" in value &&
    "exec" in value &&
    typeof (value as D1Database).prepare === "function" &&
    typeof (value as D1Database).batch === "function" &&
    typeof (value as D1Database).exec === "function"
  );
}

/**
 * Create a Prisma D1 client with validation
 *
 * This is a safer version of `createPrismaD1Client` that validates
 * the D1 binding before creating the client.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the client
 * @returns A configured PrismaClient instance
 * @throws CloudflareError if the D1 binding is invalid
 *
 * @example
 * ```typescript
 * import { createPrismaD1ClientSafe } from "@ottabase/cf/d1-prisma";
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     try {
 *       const prisma = createPrismaD1ClientSafe(env.DB);
 *       // ...
 *     } catch (error) {
 *       return new Response("Database not configured", { status: 500 });
 *     }
 *   }
 * }
 * ```
 */
export function createPrismaD1ClientSafe<T = PrismaClientType>(
  d1: unknown,
  options: PrismaD1ClientOptions = {},
): T {
  if (!isD1Database(d1)) {
    throw new CloudflareError(
      "Invalid D1 database binding. Make sure the D1 binding is configured in wrangler.toml and passed correctly.",
      "D1_INVALID_BINDING",
    );
  }

  return createPrismaD1Client<T>(d1, options);
}
