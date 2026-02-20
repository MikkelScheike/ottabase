import { getSession } from '@ottabase/auth/backend';
import { createD1Driver } from '@ottabase/db/drizzle-d1';
import { registerConnection } from '@ottabase/ottaorm';
import { User } from '@ottabase/ottaorm/models';
import { ReferralTracking } from '@ottabase/referrals';
import { errorResponse } from '@ottabase/utils/http-errors';
import { jsonResponse } from '@ottabase/utils/http-response';
import { paginatedJsonResponse, parsePaginationParams } from '@ottabase/utils/pagination';
import type { CloudflareEnv } from '../../cloudflare-env';
import { getAuthOptions } from '../lib/auth-utils';
import { readJson } from '../lib/utils';

export interface ReferralRouteContext {
    request: Request;
    env: CloudflareEnv;
    url: URL;
}

export async function handleReferralTrack(context: ReferralRouteContext): Promise<Response> {
    const { request, env } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const body = await readJson<{
        referralCode?: string;
        referer?: string;
        meta?: Record<string, any>;
    }>(request);

    if (!body.referralCode) {
        return errorResponse('referralCode is required', 400);
    }

    const referrer = await User.findByReferralUsername(body.referralCode);
    if (!referrer) {
        return errorResponse('Invalid referral code', 404, {
            code: 'INVALID_REFERRAL_CODE',
        });
    }

    // Analytics Engine: write click event (non-blocking, no D1 write per click)
    const meta = body.meta as Record<string, unknown> | undefined;
    const utm = meta?.utm as Record<string, string> | undefined;
    if (env.OBCF_ANALYTICS_REFERRALS) {
        env.OBCF_ANALYTICS_REFERRALS.writeDataPoint({
            indexes: [body.referralCode],
            blobs: [
                request.headers.get('cf-connecting-country') ?? 'unknown',
                (request.headers.get('user-agent') ?? '').slice(0, 200),
                (body.referer || request.headers.get('Referer') || '').slice(0, 500),
                referrer.get('id') ?? '',
                utm?.source ?? '',
                utm?.medium ?? '',
                utm?.campaign ?? '',
            ],
            doubles: [1],
        });
    }

    return jsonResponse({
        success: true,
        tracking: { referralCode: body.referralCode, recorded: true },
    });
}

export async function handleReferralStats(context: ReferralRouteContext): Promise<Response> {
    const { request, env } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const session = await getSession(request, env as any, getAuthOptions(env));
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse('Unauthorized', 401, { code: 'UNAUTHORIZED' });
    }

    const stats = await ReferralTracking.getStats(userId);
    return jsonResponse(stats);
}

export async function handleReferralUser(context: ReferralRouteContext): Promise<Response> {
    const { request, env } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const session = await getSession(request, env as any, getAuthOptions(env));
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse('Unauthorized', 401, { code: 'UNAUTHORIZED' });
    }

    const user = await User.find(userId);
    if (!user) {
        return errorResponse('User not found', 404);
    }

    const stats = await ReferralTracking.getStats(userId);
    const trackingRecords = await ReferralTracking.forUser(userId, {
        limit: 100,
    });

    return jsonResponse({
        user: {
            id: user.get('id'),
            name: user.get('name'),
            email: user.get('email'),
            referralUsername: user.get('referralUsername'),
            referredById: user.get('referredById'),
        },
        stats,
        tracking: trackingRecords.map((t) => t.toJson()),
    });
}

export async function handleReferralUsernameUpdate(context: ReferralRouteContext): Promise<Response> {
    const { request, env } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const body = await readJson<{
        referralUsername?: string;
    }>(request);

    const session = await getSession(request, env as any, getAuthOptions(env));
    const userId = session?.user?.id;

    if (!userId || !body.referralUsername) {
        return errorResponse('referralUsername is required', 400);
    }

    const { validateReferralUsername } = await import('@ottabase/referrals');
    const validation = validateReferralUsername(body.referralUsername);

    if (!validation.valid) {
        return errorResponse(validation.error || 'Invalid username', 400, {
            code: 'INVALID_USERNAME',
        });
    }

    const existing = await User.findByReferralUsername(body.referralUsername);
    if (existing && existing.get('id') !== userId) {
        return errorResponse('Username already taken', 400, {
            code: 'USERNAME_TAKEN',
        });
    }

    const user = await User.find(userId);
    if (!user) {
        return errorResponse('User not found', 404);
    }

    user.set('referralUsername', body.referralUsername);
    await user.save();

    return jsonResponse({
        success: true,
        user: user.toJson(),
    });
}

export async function handleReferralTrackingList(context: ReferralRouteContext): Promise<Response> {
    const { request, env, url } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const session = await getSession(request, env as any, getAuthOptions(env));
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse('Unauthorized', 401, { code: 'UNAUTHORIZED' });
    }

    const { page, perPage } = parsePaginationParams(url.searchParams);
    const status = url.searchParams.get('status') as 'pending' | 'completed' | 'invalid' | null;

    const offset = (page - 1) * perPage;
    const trackingRecords = await ReferralTracking.forUser(userId, {
        status: status || undefined,
        limit: perPage,
        offset,
    });

    const allRecords = await ReferralTracking.forUser(userId, {
        status: status || undefined,
    });

    return paginatedJsonResponse({
        data: trackingRecords.map((t) => t.toJson()),
        total: allRecords.length,
        page,
        perPage,
        path: '/api/referrals/tracking',
    });
}

/**
 * Handle GET /api/referrals/analytics - query WAE for referral click analytics
 * Requires auth. Params: referralCode (optional), days (default 7), groupBy (country|referralCode|day)
 */
export async function handleReferralsAnalytics(context: ReferralRouteContext): Promise<Response> {
    const { env, request, url } = context;

    const session = await getSession(request, env as any, getAuthOptions(env));
    const userId = session?.user?.id;
    const isDev =
        !env.ENVIRONMENT ||
        env.ENVIRONMENT === 'development' ||
        env.ENVIRONMENT === 'dev' ||
        env.ENVIRONMENT === 'test';

    if (!userId && !isDev) {
        return errorResponse('Unauthorized', 401, { code: 'UNAUTHORIZED' });
    }

    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_ANALYTICS_API_TOKEN) {
        return errorResponse(
            'Analytics not configured: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_API_TOKEN required',
            503,
            {
                code: 'ANALYTICS_NOT_CONFIGURED',
            },
        );
    }

    const referralCode = url.searchParams.get('referralCode') ?? '';
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get('days') ?? '7', 10)));
    const groupBy = url.searchParams.get('groupBy') ?? 'country';

    // WAE schema: index1=referralCode, blob1=country, blob2=userAgent, blob3=referer, blob4=userId, blob5=utm_source, blob6=utm_medium, blob7=utm_campaign, double1=1
    const safeReferralCode = /^[a-zA-Z0-9_-]+$/.test(referralCode) ? referralCode.replace(/'/g, "''") : '';
    const indexFilter = safeReferralCode ? `AND index1 = '${safeReferralCode}'` : '';

    let sql: string;
    if (groupBy === 'country') {
        sql = `SELECT blob1 AS dimension, SUM(_sample_interval) AS clicks
FROM referral_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY ${indexFilter}
GROUP BY dimension
ORDER BY clicks DESC
LIMIT 100`;
    } else if (groupBy === 'referralCode') {
        sql = `SELECT index1 AS dimension, SUM(_sample_interval) AS clicks
FROM referral_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY
GROUP BY dimension
ORDER BY clicks DESC
LIMIT 100`;
    } else if (groupBy === 'day') {
        sql = `SELECT toStartOfDay(timestamp) AS dimension, SUM(_sample_interval) AS clicks
FROM referral_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY ${indexFilter}
GROUP BY dimension
ORDER BY dimension ASC
LIMIT 90`;
    } else {
        return errorResponse('Invalid groupBy: use country, referralCode, or day', 400, { code: 'INVALID_GROUPBY' });
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.CLOUDFLARE_ANALYTICS_API_TOKEN}`,
        },
        body: sql,
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('WAE SQL API error:', res.status, text);
        return errorResponse('Analytics query failed', 502, { code: 'ANALYTICS_ERROR', detail: text });
    }

    const json = (await res.json()) as { data?: unknown[]; result?: unknown[]; meta?: Record<string, unknown> };
    const data = json.data ?? json.result ?? [];
    const meta = json.meta ?? {};

    return jsonResponse({
        data,
        meta: { groupBy, days, referralCode: referralCode || null },
    });
}
