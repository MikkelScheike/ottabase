/**
 * OttaORM User API - Single User Operations
 * Eloquent-like syntax - no driver parameter needed!
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { setDriver, User } from "@ottabase/ottaorm";

export const runtime = "edge";

/**
 * GET /api/ottaorm/users/[id] - Get a single user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    if (!env.DB) {
      return NextResponse.json(
        { error: "D1 database not configured" },
        { status: 500 }
      );
    }

    setDriver(createD1Driver(env.DB));

    // Eloquent-like syntax!
    const user = await User.find(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: user.toJson(),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ottaorm/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    if (!env.DB) {
      return NextResponse.json(
        { error: "D1 database not configured" },
        { status: 500 }
      );
    }

    setDriver(createD1Driver(env.DB));

    // Eloquent-like syntax!
    const deleted = await User.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
