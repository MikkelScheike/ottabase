import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createPrismaD1Client } from '@ottabase/cf/d1-prisma';
import type { PrismaClient } from '@prisma/client';

export const runtime = 'edge';

// GET /api/cloudflare/d1/todos - List all todos (using Prisma)
export async function GET(_request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.OBCF_D1) {
      return NextResponse.json(
        { error: 'D1 database binding not configured' },
        { status: 500 }
      );
    }

    // ✅ Use Prisma with D1 adapter (type-safe queries)
    const prisma = createPrismaD1Client<PrismaClient>(env.OBCF_D1);

    // Type-safe query with Prisma ORM
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error('D1 GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch todos',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/cloudflare/d1/todos - Create a new todo (using Prisma)
export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.OBCF_D1) {
      return NextResponse.json(
        { error: 'D1 database binding not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    // ✅ Use Prisma with D1 adapter (type-safe operations)
    const prisma = createPrismaD1Client<PrismaClient>(env.OBCF_D1);

    // Type-safe create operation
    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        completed: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Todo created successfully',
      todo,
    });
  } catch (error) {
    console.error('D1 POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create todo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
