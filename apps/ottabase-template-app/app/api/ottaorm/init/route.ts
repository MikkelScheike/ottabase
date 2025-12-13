/**
 * OttaORM Database Initialization API
 *
 * This endpoint runs migrations to create database tables.
 * Runs CORE migrations (from @ottabase/ottaorm) + APP migrations (from ottabase/)
 *
 * Security:
 * - Development: No authentication required
 * - Production: Requires MIGRATION_SECRET via query param, body, or header
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { coreMigrations, runMigrations } from "@ottabase/ottaorm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appMigrations } from "../../../../ottabase/migrations";

export const runtime = "edge";

/**
 * Check authentication for migration endpoint
 */
async function checkAuth(request: NextRequest, env: any): Promise<boolean> {
  // Allow in development without auth
  const isDev = env.ENVIRONMENT === 'development' || !env.ENVIRONMENT;
  if (isDev) {
    return true;
  }

  // Production: require secret
  if (!env.MIGRATION_SECRET) {
    console.error('[MIGRATION] MIGRATION_SECRET not configured in production');
    return false;
  }

  // Check for secret in multiple places
  let providedSecret: string | null = null;

  // 1. Query parameter: ?secret=xxx
  const url = new URL(request.url);
  providedSecret = url.searchParams.get('secret');

  // 2. Body parameter (if POST)
  if (!providedSecret && request.method === 'POST') {
    try {
      const body = await request.json();
      providedSecret = body.secret;
    } catch {
      // Not JSON or no body
    }
  }

  // 3. Authorization header: Bearer xxx
  if (!providedSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      providedSecret = authHeader.substring(7);
    }
  }

  return providedSecret === env.MIGRATION_SECRET;
}

export async function GET(request: NextRequest) {
  return handleMigration(request);
}

export async function POST(request: NextRequest) {
  return handleMigration(request);
}

async function handleMigration(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.OBCF_D1) {
      return NextResponse.json(
        { error: "D1 database not configured" },
        { status: 500 }
      );
    }

    // Check authentication
    const isAuthorized = await checkAuth(request, env);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized - MIGRATION_SECRET required in production" },
        { status: 401 }
      );
    }

    // Create driver
    const driver = createD1Driver(env.OBCF_D1);

    // Run core migrations + app migrations
    const result = await runMigrations(driver, [
      ...coreMigrations,    // Core models: User, Account, Post, Tag
      ...appMigrations       // App models: Todo
    ]);

    return NextResponse.json({
      success: true,
      message: "Database migrations completed successfully",
      executed: result.executed,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
