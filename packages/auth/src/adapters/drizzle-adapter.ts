// ============================================================
// @ottabase/auth - Drizzle D1 Auth.js Adapter
// ============================================================
//
// Custom Auth.js adapter for Drizzle ORM with Cloudflare D1 support
// Implements the Auth.js Adapter interface for database operations
//
// Based on @auth/drizzle-adapter but optimized for D1 and Ottabase
//
// ============================================================

import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import type { D1Database } from "@cloudflare/workers-types";
import type { D1Driver } from "@ottabase/db/drizzle-d1";
import { createD1Driver } from "@ottabase/db/drizzle-d1";

/**
 * Options for creating a Drizzle D1 Auth.js adapter
 */
export interface DrizzleD1AuthAdapterOptions {
  /**
   * Enable query logging
   * - `true`: Enable all log levels
   * - `false`: Disable logging
   * - Array: Specific log levels to enable
   */
  log?: boolean | ("query" | "info" | "warn" | "error")[];

  /**
   * Optional custom D1Driver instance
   * If not provided, a new driver will be created
   */
  driver?: D1Driver;
}

/**
 * Create an Auth.js adapter for Cloudflare D1 using Drizzle ORM
 *
 * This adapter provides Auth.js database operations using Drizzle ORM
 * optimized for Cloudflare D1. It uses raw SQL queries for maximum
 * compatibility and performance with D1.
 *
 * @param d1 - The D1 database binding from the Worker environment
 * @param options - Optional configuration for the adapter
 * @returns An Auth.js compatible adapter
 *
 * @example
 * ```typescript
 * import { createDrizzleD1AuthAdapter } from "@ottabase/auth/adapters/drizzle";
 *
 * export const authConfig = {
 *   adapter: createDrizzleD1AuthAdapter(env.OBCF_D1),
 *   providers: [
 *     // Your providers
 *   ],
 * };
 * ```
 *
 * @example
 * ```typescript
 * // With logging enabled
 * const adapter = createDrizzleD1AuthAdapter(env.OBCF_D1, {
 *   log: ["query", "error"]
 * });
 * ```
 */
export function createDrizzleD1AuthAdapter(
  d1: D1Database,
  options: DrizzleD1AuthAdapterOptions = {},
): Adapter {
  const driver = options.driver || createD1Driver(d1, { log: options.log });
  const d1Binding = driver.getD1();

  return {
    // ============================================================
    // USER OPERATIONS
    // ============================================================

    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await d1Binding
        .prepare(
          `INSERT INTO User (id, name, email, emailVerified, image, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          user.name,
          user.email,
          user.emailVerified?.toISOString() || null,
          user.image,
          now,
          now,
        )
        .run();

      return {
        id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const result = await d1Binding
        .prepare(
          `SELECT id, name, email, emailVerified, image FROM User WHERE id = ?`,
        )
        .bind(id)
        .first<AdapterUser>();

      if (!result) return null;

      return {
        ...result,
        emailVerified: result.emailVerified
          ? new Date(result.emailVerified as unknown as string)
          : null,
      };
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const result = await d1Binding
        .prepare(
          `SELECT id, name, email, emailVerified, image FROM User WHERE email = ?`,
        )
        .bind(email)
        .first<AdapterUser>();

      if (!result) return null;

      return {
        ...result,
        emailVerified: result.emailVerified
          ? new Date(result.emailVerified as unknown as string)
          : null,
      };
    },

    async getUserByAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }): Promise<AdapterUser | null> {
      const result = await d1Binding
        .prepare(
          `SELECT u.id, u.name, u.email, u.emailVerified, u.image
           FROM User u
           INNER JOIN Account a ON u.id = a.userId
           WHERE a.provider = ? AND a.providerAccountId = ?`,
        )
        .bind(provider, providerAccountId)
        .first<AdapterUser>();

      if (!result) return null;

      return {
        ...result,
        emailVerified: result.emailVerified
          ? new Date(result.emailVerified as unknown as string)
          : null,
      };
    },

    async updateUser(
      user: Partial<AdapterUser> & Pick<AdapterUser, "id">,
    ): Promise<AdapterUser> {
      const updates: string[] = [];
      const values: any[] = [];

      if (user.name !== undefined) {
        updates.push("name = ?");
        values.push(user.name);
      }
      if (user.email !== undefined) {
        updates.push("email = ?");
        values.push(user.email);
      }
      if (user.emailVerified !== undefined) {
        updates.push("emailVerified = ?");
        values.push(user.emailVerified?.toISOString() || null);
      }
      if (user.image !== undefined) {
        updates.push("image = ?");
        values.push(user.image);
      }

      updates.push("updatedAt = ?");
      values.push(new Date().toISOString());

      values.push(user.id);

      await d1Binding
        .prepare(`UPDATE User SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...values)
        .run();

      const result = await d1Binding
        .prepare(
          `SELECT id, name, email, emailVerified, image FROM User WHERE id = ?`,
        )
        .bind(user.id)
        .first<AdapterUser>();

      return {
        ...result!,
        emailVerified: result!.emailVerified
          ? new Date(result!.emailVerified as unknown as string)
          : null,
      };
    },

    async deleteUser(userId: string): Promise<void> {
      await d1Binding
        .prepare(`DELETE FROM User WHERE id = ?`)
        .bind(userId)
        .run();
    },

    // ============================================================
    // ACCOUNT OPERATIONS
    // ============================================================

    async linkAccount(account: AdapterAccount): Promise<AdapterAccount> {
      const id = crypto.randomUUID();

      await d1Binding
        .prepare(
          `INSERT INTO Account (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          account.expires_at || null,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null,
        )
        .run();

      return { ...account, id };
    },

    async unlinkAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }): Promise<void> {
      await d1Binding
        .prepare(
          `DELETE FROM Account WHERE provider = ? AND providerAccountId = ?`,
        )
        .bind(provider, providerAccountId)
        .run();
    },

    // ============================================================
    // SESSION OPERATIONS
    // ============================================================

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      const id = crypto.randomUUID();

      await d1Binding
        .prepare(
          `INSERT INTO Session (id, sessionToken, userId, expires)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(
          id,
          session.sessionToken,
          session.userId,
          session.expires.toISOString(),
        )
        .run();

      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },

    async getSessionAndUser(
      sessionToken: string,
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const result = await d1Binding
        .prepare(
          `SELECT
            s.sessionToken, s.userId, s.expires,
            u.id as user_id, u.name, u.email, u.emailVerified, u.image
           FROM Session s
           INNER JOIN User u ON s.userId = u.id
           WHERE s.sessionToken = ?`,
        )
        .bind(sessionToken)
        .first<any>();

      if (!result) return null;

      // Check if session is expired
      if (new Date(result.expires) < new Date()) {
        await d1Binding
          .prepare(`DELETE FROM Session WHERE sessionToken = ?`)
          .bind(sessionToken)
          .run();
        return null;
      }

      return {
        session: {
          sessionToken: result.sessionToken,
          userId: result.userId,
          expires: new Date(result.expires),
        },
        user: {
          id: result.user_id,
          name: result.name,
          email: result.email,
          emailVerified: result.emailVerified
            ? new Date(result.emailVerified)
            : null,
          image: result.image,
        },
      };
    },

    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">,
    ): Promise<AdapterSession> {
      const updates: string[] = [];
      const values: any[] = [];

      if (session.expires !== undefined) {
        updates.push("expires = ?");
        values.push(session.expires.toISOString());
      }

      values.push(session.sessionToken);

      await d1Binding
        .prepare(
          `UPDATE Session SET ${updates.join(", ")} WHERE sessionToken = ?`,
        )
        .bind(...values)
        .run();

      const result = await d1Binding
        .prepare(
          `SELECT sessionToken, userId, expires FROM Session WHERE sessionToken = ?`,
        )
        .bind(session.sessionToken)
        .first<any>();

      return {
        sessionToken: result!.sessionToken,
        userId: result!.userId,
        expires: new Date(result!.expires),
      };
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await d1Binding
        .prepare(`DELETE FROM Session WHERE sessionToken = ?`)
        .bind(sessionToken)
        .run();
    },

    // ============================================================
    // VERIFICATION TOKEN OPERATIONS
    // ============================================================

    async createVerificationToken(
      token: VerificationToken,
    ): Promise<VerificationToken> {
      await d1Binding
        .prepare(
          `INSERT INTO VerificationToken (identifier, token, expires)
           VALUES (?, ?, ?)`,
        )
        .bind(token.identifier, token.token, token.expires.toISOString())
        .run();

      return token;
    },

    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const result = await d1Binding
        .prepare(
          `SELECT identifier, token, expires FROM VerificationToken WHERE identifier = ? AND token = ?`,
        )
        .bind(identifier, token)
        .first<any>();

      if (!result) return null;

      await d1Binding
        .prepare(
          `DELETE FROM VerificationToken WHERE identifier = ? AND token = ?`,
        )
        .bind(identifier, token)
        .run();

      return {
        identifier: result.identifier,
        token: result.token,
        expires: new Date(result.expires),
      };
    },
  };
}

/**
 * Cached version using WeakMap for D1 binding
 * Useful when the same D1 binding is used multiple times
 */
const adapterCache = new WeakMap<D1Database, Adapter>();

export function createDrizzleD1AuthAdapterCached(
  d1: D1Database,
  options: DrizzleD1AuthAdapterOptions = {},
): Adapter {
  const cached = adapterCache.get(d1);
  if (cached) return cached;

  const adapter = createDrizzleD1AuthAdapter(d1, options);
  adapterCache.set(d1, adapter);
  return adapter;
}
