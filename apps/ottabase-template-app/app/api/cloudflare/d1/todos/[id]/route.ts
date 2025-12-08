import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createPrismaD1Client } from '@ottabase/cf/d1-prisma';
import type { PrismaClient } from '@prisma/client';

export const runtime = 'edge';

// PATCH /api/cloudflare/d1/todos/[id] - Update a todo (using Prisma)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.DB) {
      return NextResponse.json(
        { error: 'D1 database binding not configured' },
        { status: 500 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { completed } = body;

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed must be a boolean' },
        { status: 400 }
      );
    }

    // ✅ Use Prisma with D1 adapter (type-safe updates)
    const prisma = createPrismaD1Client<PrismaClient>(env.DB);

    // Type-safe update operation
    const todo = await prisma.todo.update({
      where: { id },
      data: { completed },
    });

    return NextResponse.json({
      success: true,
      message: 'Todo updated successfully',
      todo,
    });
  } catch (error) {
    console.error('D1 PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update todo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cloudflare/d1/todos/[id] - Delete a todo (using Prisma)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.DB) {
      return NextResponse.json(
        { error: 'D1 database binding not configured' },
        { status: 500 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // ✅ Use Prisma with D1 adapter (type-safe deletes)
    const prisma = createPrismaD1Client<PrismaClient>(env.DB);

    // Type-safe delete operation
    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    console.error('D1 DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete todo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
