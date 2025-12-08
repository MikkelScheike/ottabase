import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createPrismaD1Client } from '@ottabase/cf/d1-prisma';
import type { PrismaClient } from '@prisma/client';

export const runtime = 'edge';

export async function POST(_request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.DB) {
      return NextResponse.json(
        { error: 'D1 database binding not configured. Check wrangler.jsonc' },
        { status: 500 }
      );
    }

    // ✅ Use Prisma with D1 adapter
    const prisma = createPrismaD1Client<PrismaClient>(env.DB);

    // Test the connection by counting todos
    // In production, use migrations: pnpm db:migrate --name=init
    const count = await prisma.todo.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection verified successfully',
      info: `Found ${count} existing todos. Use 'pnpm db:migrate --name=init' to run migrations.`,
    });
  } catch (error) {
    console.error('D1 initialization error:', error);

    // If the table doesn't exist, provide helpful migration instructions
    if (
      error instanceof Error &&
      error.message.includes('no such table')
    ) {
      return NextResponse.json(
        {
          error: 'Database not initialized',
          message:
            'Run migrations first: cd apps/ottabase-template-app && pnpm db:migrate --name=init --apply=local',
          hint: 'Or use wrangler: wrangler d1 execute DB --local --file=prisma/migrations/.../migration.sql',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to verify database connection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
