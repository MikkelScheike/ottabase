import { getSession } from '@ottabase/auth/backend';
import { createD1Driver } from '@ottabase/db/drizzle-d1';
import { registerConnection } from '@ottabase/ottaorm';
import { Shortlink, buildRedirectResponse } from '@ottabase/shortlinks';
import { errorResponse } from '@ottabase/utils/http-errors';
import { jsonResponse } from '@ottabase/utils/http-response';
import { paginatedJsonResponse, parsePaginationParams } from '@ottabase/utils/pagination';
import type { CloudflareEnv } from '../../cloudflare-env';
import { getAuthOptions } from '../lib/auth-utils';
import { readJson } from '../lib/utils';

export interface ShortlinkContext {
    request: Request;
    env: CloudflareEnv;
    url: URL;
}

/** Push shortlink click to Analytics Engine (non-blocking; never throws) */
function pushShortlinkClick(env: CloudflareEnv, request: Request, shortCode: string, fullUrl: string): void {
    if (!env.OBCF_ANALYTICS_SHORTLINKS) return;
    try {
        env.OBCF_ANALYTICS_SHORTLINKS.writeDataPoint({
            indexes: [shortCode || 'unknown'],
            blobs: [
                request.headers.get('cf-connecting-country') ?? 'unknown',
                (request.headers.get('user-agent') ?? '').slice(0, 200),
                request.headers.get('referer') ?? '',
                fullUrl ?? '',
            ],
            doubles: [1],
        });
    } catch (e) {
        console.warn('[shortlinks] Analytics write failed (non-fatal):', e);
    }
}

export async function handleShortlinksList(context: ShortlinkContext): Promise<Response> {
    const { env, url } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const { page, perPage, orderBy, order } = parsePaginationParams(url.searchParams);
    const appId = url.searchParams.get('appId');
    const type = url.searchParams.get('type');
    const where: Record<string, unknown> = {};
    if (appId) where.appId = appId;
    if (type) where.type = type;

    const paginationResult = await Shortlink.paginate(
        page,
        perPage,
        Object.keys(where).length > 0 ? where : undefined,
        { orderBy, orderDirection: order },
    );

    return paginatedJsonResponse({
        data: paginationResult.data.map((s) => s.toJson()),
        total: paginationResult.total,
        page: paginationResult.page,
        perPage: paginationResult.perPage,
        path: '/api/shortlinks',
    });
}

export async function handleShortlinksCreate(context: ShortlinkContext): Promise<Response> {
    const { env, request } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const body = await readJson<{
        fullUrl?: string;
        shortCode?: string;
        type?: string;
        appId?: string;
        expiryDate?: string | null;
    }>(request);

    if (!body.fullUrl || !body.shortCode) {
        return errorResponse('fullUrl and shortCode are required', 400);
    }

    const existing = await Shortlink.findByCode(body.shortCode);
    if (existing) {
        return errorResponse('Short code already exists', 409, {
            code: 'DUPLICATE_SHORT_CODE',
        });
    }

    try {
        const expiryDate = body.expiryDate ? new Date(body.expiryDate).getTime() : null;
        const shortlink = await Shortlink.create({
            fullUrl: body.fullUrl,
            shortCode: body.shortCode,
            type: body.type || 'redirect',
            appId: body.appId || 'default',
            expiryDate: Number.isNaN(expiryDate) ? null : expiryDate,
        });

        return jsonResponse({
            success: true,
            data: shortlink.toJson(),
        });
    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : 'Failed to create shortlink', 400, {
            code: 'VALIDATION_ERROR',
        });
    }
}

export async function handleShortlinkById(
    context: ShortlinkContext,
    id: string,
    method: 'PATCH' | 'DELETE',
): Promise<Response> {
    const { env, request } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    if (method === 'PATCH') {
        const body = await readJson<{
            fullUrl?: string;
            shortCode?: string;
            type?: string;
            expiryDate?: string | null;
        }>(request);

        const shortlink = await Shortlink.find(id);
        if (!shortlink) {
            return errorResponse('Shortlink not found', 404);
        }

        if (body.shortCode && body.shortCode !== shortlink.get('shortCode')) {
            const existing = await Shortlink.findByCode(body.shortCode);
            if (existing) {
                return errorResponse('Short code already exists', 409, {
                    code: 'DUPLICATE_SHORT_CODE',
                });
            }
            shortlink.set('shortCode', body.shortCode);
        }

        if (body.fullUrl) shortlink.set('fullUrl', body.fullUrl);
        if (body.type) shortlink.set('type', body.type);
        if (body.expiryDate !== undefined) {
            const expiryDate = body.expiryDate ? new Date(body.expiryDate).getTime() : null;
            shortlink.set('expiryDate', Number.isNaN(expiryDate) ? null : expiryDate);
        }

        try {
            await shortlink.save();
            return jsonResponse({
                success: true,
                data: shortlink.toJson(),
            });
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update shortlink', 400, {
                code: 'VALIDATION_ERROR',
            });
        }
    }

    const shortlink = await Shortlink.find(id);
    if (!shortlink) {
        return errorResponse('Shortlink not found', 404);
    }

    await Shortlink.delete(id);
    return jsonResponse({
        success: true,
        message: 'Shortlink deleted successfully',
    });
}

export async function handleShortlinkExplicitGo(context: ShortlinkContext): Promise<Response> {
    const { request, env, url } = context;
    if (!env.OBCF_D1) {
        return errorResponse('D1 database binding not configured', 500, {
            code: 'CONFIG_ERROR',
        });
    }

    const code = url.searchParams.get('code') || url.searchParams.get('s') || url.searchParams.get('id');
    if (!code) {
        return errorResponse('Missing shortlink code', 400, {
            hint: 'Use /shortlinks/go?code=... or ?s=...',
        });
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    try {
        const shortlink = await Shortlink.findByCode(code);

        if (!shortlink) {
            return errorResponse('Shortlink not found', 404, {
                code: 'LINK_NOT_FOUND',
            });
        }

        pushShortlinkClick(env, request, shortlink.get('shortCode') ?? 'unknown', shortlink.get('fullUrl') ?? '');
        return buildRedirectResponse(shortlink);
    } catch (error) {
        console.error('Shortlink explicit redirect error:', error);
        return errorResponse('Failed to process shortlink', 500);
    }
}

export async function handleShortlinkFallback(context: ShortlinkContext): Promise<Response | null> {
    const { env, request, url } = context;
    if (
        !env.OBCF_D1 ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/@') ||
        url.pathname === '/' ||
        /\.[a-zA-Z0-9]+$/.test(url.pathname)
    ) {
        return null;
    }

    registerConnection('default', createD1Driver(env.OBCF_D1));

    const shortCode = url.pathname.substring(1);
    const shortlink = await Shortlink.findByCode(shortCode);
    if (!shortlink) {
        return null;
    }

    pushShortlinkClick(env, request, shortlink.get('shortCode') ?? 'unknown', shortlink.get('fullUrl') ?? '');
    return buildRedirectResponse(shortlink);
}

/**
 * Handle GET /api/shortlinks/analytics - query WAE for click analytics
 * Requires auth. Params: shortCode (optional), days (default 7), groupBy (country|shortCode|day)
 */
export async function handleShortlinksAnalytics(context: ShortlinkContext): Promise<Response> {
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

    const shortCode = url.searchParams.get('shortCode') ?? '';
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get('days') ?? '7', 10)));
    const groupBy = url.searchParams.get('groupBy') ?? 'country';

    // Build SQL based on groupBy
    // WAE schema: index1=shortCode, blob1=country, blob2=userAgent, blob3=referer, blob4=fullUrl, double1=1
    // Sanitize shortCode: alphanumeric, dash, underscore only
    const safeShortCode = /^[a-zA-Z0-9_-]+$/.test(shortCode) ? shortCode.replace(/'/g, "''") : '';
    const indexFilter = safeShortCode ? `AND index1 = '${safeShortCode}'` : '';

    let sql: string;
    if (groupBy === 'country') {
        sql = `SELECT blob1 AS dimension, SUM(_sample_interval) AS clicks
FROM shortlink_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY ${indexFilter}
GROUP BY dimension
ORDER BY clicks DESC
LIMIT 100`;
    } else if (groupBy === 'shortCode') {
        sql = `SELECT index1 AS dimension, SUM(_sample_interval) AS clicks
FROM shortlink_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY
GROUP BY dimension
ORDER BY clicks DESC
LIMIT 100`;
    } else if (groupBy === 'day') {
        sql = `SELECT toStartOfDay(timestamp) AS dimension, SUM(_sample_interval) AS clicks
FROM shortlink_clicks
WHERE timestamp > now() - INTERVAL '${days}' DAY ${indexFilter}
GROUP BY dimension
ORDER BY dimension ASC
LIMIT 90`;
    } else {
        return errorResponse('Invalid groupBy: use country, shortCode, or day', 400, { code: 'INVALID_GROUPBY' });
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
        meta: { groupBy, days, shortCode: shortCode || null },
    });
}
