import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
// import { RealtimeBroadcaster } from '@ottabase/cf-realtime/server';

// TODO: Re-enable edge runtime after fixing Cloudflare Workers module bundling
// export const runtime = 'edge';

/**
 * Get realtime stats
 * GET /api/cloudflare/realtime/stats
 */
export async function GET(_request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();

    if (!env.REALTIME) {
      return NextResponse.json(
        { error: 'Realtime Durable Object binding not configured' },
        { status: 500 }
      );
    }

    // TODO: Re-enable after fixing bundling
    // const broadcaster = new RealtimeBroadcaster(env.REALTIME);
    // const stats = await broadcaster.getStats();

    return NextResponse.json({
      totalConnections: 0,
      channels: [],
      offlineMessagesQueued: 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
