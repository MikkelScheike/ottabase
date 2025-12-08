/**
 * OttaORM Post API - Single Post Operations
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { setDriver, Post } from "@ottabase/ottaorm";

export const runtime = "edge";

/**
 * GET /api/ottaorm/posts/[id] - Get a single post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getRequestContext();
    const { id } = await params;

    if (!env.DB) {
      return NextResponse.json(
        { error: "D1 database not configured" },
        { status: 500 }
      );
    }

    setDriver(createD1Driver(env.DB));

    // Eloquent-like syntax!
    const post = await Post.find(id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      post: post.toJson(),
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ottaorm/posts/[id] - Delete a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getRequestContext();
    const { id } = await params;

    if (!env.DB) {
      return NextResponse.json(
        { error: "D1 database not configured" },
        { status: 500 }
      );
    }

    setDriver(createD1Driver(env.DB));

    // Eloquent-like syntax!
    const deleted = await Post.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      {
        error: "Failed to delete post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
