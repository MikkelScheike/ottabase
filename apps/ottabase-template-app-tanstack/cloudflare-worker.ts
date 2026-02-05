import { RealtimeActor } from '@ottabase/cf-realtime/server';
import { errorResponse, ServiceError } from '@ottabase/utils/http-errors';
import { jsonResponse } from '@ottabase/utils/http-response';
import { queueHandler } from './ottabase/queue';
import { initDbConnection } from './worker/lib/db-utils';
import {
    handleAuthConfig,
    handleVerifyEmail,
    handleVerifyEmailResend,
    handlePasswordResetConfirm,
    handlePasswordResetRequest,
    handleUserProfile,
    handleAuthRegister,
    handleAuthJsRequest,
} from './worker/routes/auth';
import { handleEmailProviders, handleEmailTest } from './worker/routes/email';
import { handleAdminCronCreate, handleAdminCronList, handleCronTask } from './worker/routes/admin-cron';
import {
    handleBlogStudioActivateTheme,
    handleBlogStudioPluginConfig,
    handleBlogStudioPluginEnable,
    handleBlogStudioState,
    handleBlogPostBySlug,
    handleBlogPostUnlock,
    handleBlogPostsList,
} from './worker/routes/blog';
import { handleOttaormCrud } from './worker/routes/ottaorm-crud';
import {
    handleShortlinkById,
    handleShortlinkExplicitGo,
    handleShortlinkFallback,
    handleShortlinksCreate,
    handleShortlinksList,
} from './worker/routes/shortlinks';
import {
    handleReferralStats,
    handleReferralTrackingList,
    handleReferralTrack,
    handleReferralUser,
    handleReferralUsernameUpdate,
} from './worker/routes/referrals';
import { handleDemo, handleDemoError, handleAuditLogs } from './worker/routes/demo';
import {
    handleCloudflareImages,
    handleCloudflareKV,
    handleCloudflareR2,
    handleUpload,
    handleUploadFile,
} from './worker/routes/cloudflare-storage';
import { handleD1Init, handleD1TodoById, handleD1Todos } from './worker/routes/cloudflare-d1';
import { handleCloudflareQueue } from './worker/routes/cloudflare-queue';
import {
    handleAdminQueuesDLQJob,
    handleAdminQueuesDLQList,
    handleAdminQueuesDLQPurge,
    handleAdminQueuesDLQRetryAll,
    handleAdminQueuesDLQRetryJob,
    handleAdminQueuesFailed,
    handleAdminQueuesOverview,
    handleAdminQueuesPending,
    handleAdminQueuesProcessed,
    handleAdminQueuesResetStats,
} from './worker/routes/admin-queues';
import { handleRateLimiting } from './worker/routes/cloudflare-rate';
import {
    handleRealtimeBroadcast,
    handleRealtimeStats,
    handleRealtimeWebsocket,
} from './worker/routes/cloudflare-realtime';
import { handleModelsMetadata, handleOttaormInit } from './worker/routes/ottaorm-init';
import {
    handleAdminDbRowDelete,
    handleAdminDbTableData,
    handleAdminDbTableDelete,
    handleAdminDbTables,
} from './worker/routes/admin-db';
import type { CloudflareEnv } from './cloudflare-env';

export { RealtimeActor };

const SPA_REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function normalizePath(path: string): string {
    if (path !== '/' && path.endsWith('/')) {
        return path.slice(0, -1);
    }
    return path;
}

function isHtmlRequest(request: Request): boolean {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
        return false;
    }

    const accept = request.headers.get('Accept');
    return !!accept && accept.includes('text/html');
}

export default {
    async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
        try {
            initDbConnection(env);

            const url = new URL(request.url);
            const origin = request.headers.get('Origin') || '*';
            const normalizedPathname = normalizePath(url.pathname);
            const authCorsHeaders = {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                Vary: 'Origin',
            };
            const withAuthCors = (response: Response) => {
                try {
                    Object.entries(authCorsHeaders).forEach(([key, value]) => {
                        response.headers.set(key, value);
                    });
                    return response;
                } catch {
                    const headers = new Headers(response.headers);
                    Object.entries(authCorsHeaders).forEach(([key, value]) => {
                        headers.set(key, value);
                    });
                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers,
                    });
                }
            };

            if (normalizedPathname.startsWith('/api/') && request.method === 'OPTIONS') {
                return new Response(null, {
                    status: 204,
                    headers: authCorsHeaders,
                });
            }

            if (normalizedPathname === '/api/health') {
                return jsonResponse({
                    ok: true,
                    name: 'ottabase-template-app-tanstack',
                    timestamp: Date.now(),
                });
            }

            if (normalizedPathname === '/api/auth/config' && request.method === 'GET') {
                return handleAuthConfig({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/auth/verify-email/resend' && request.method === 'POST') {
                return handleVerifyEmailResend({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/auth/verify-email' && request.method === 'GET') {
                return handleVerifyEmail({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/auth/password/reset/request' && request.method === 'POST') {
                return handlePasswordResetRequest({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/auth/password/reset/confirm' && request.method === 'POST') {
                return handlePasswordResetConfirm({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/users/me') {
                return handleUserProfile({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/email/providers' && request.method === 'GET') {
                return handleEmailProviders({ request, env, url });
            }

            if (normalizedPathname === '/api/email/test' && request.method === 'POST') {
                return handleEmailTest({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/cron' && request.method === 'GET') {
                return handleAdminCronList({ request, env });
            }

            if (normalizedPathname === '/api/admin/cron' && request.method === 'POST') {
                return handleAdminCronCreate({ request, env });
            }

            const cronTaskMatch = normalizedPathname.match(/^\/api\/admin\/cron\/(.+)$/);
            if (cronTaskMatch) {
                const taskId = cronTaskMatch[1];
                const action = taskId.endsWith('/toggle') ? 'toggle' : taskId.endsWith('/run') ? 'run' : null;
                return (
                    handleCronTask({ request, env }, taskId, action) ??
                    errorResponse('Not found', 404, { code: 'NOT_FOUND' })
                );
            }

            if (normalizedPathname.startsWith('/api/blog/studio/')) {
                if (!env.OBCF_D1) {
                    return errorResponse('D1 database binding not configured', 500, {
                        code: 'CONFIG_ERROR',
                    });
                }

                if (normalizedPathname === '/api/blog/studio/state' && request.method === 'GET') {
                    return handleBlogStudioState({ request, env, url });
                }

                if (normalizedPathname === '/api/blog/studio/theme/activate' && request.method === 'POST') {
                    return handleBlogStudioActivateTheme({ request, env, url });
                }

                if (normalizedPathname === '/api/blog/studio/plugin/enable' && request.method === 'POST') {
                    return handleBlogStudioPluginEnable({ request, env, url });
                }

                if (normalizedPathname === '/api/blog/studio/plugin/config' && request.method === 'POST') {
                    return handleBlogStudioPluginConfig({ request, env, url });
                }
            }

            if (normalizedPathname.startsWith('/api/blog/posts') && env.OBCF_D1) {
                if (normalizedPathname === '/api/blog/posts' && request.method === 'GET') {
                    return handleBlogPostsList({ request, env, url });
                }

                const bySlugMatch = normalizedPathname.match(/^\/api\/blog\/posts\/by-slug\/([^/]+)$/);
                if (bySlugMatch && request.method === 'GET') {
                    const slug = decodeURIComponent(bySlugMatch[1]);
                    return handleBlogPostBySlug({ request, env, url }, slug);
                }

                if (normalizedPathname === '/api/blog/posts/unlock' && request.method === 'POST') {
                    return handleBlogPostUnlock({ request, env, url });
                }
            }

            if (
                normalizedPathname.startsWith('/api/ottaorm/') &&
                normalizedPathname !== '/api/ottaorm/init' &&
                normalizedPathname !== '/api/ottaorm/models-metadata'
            ) {
                return handleOttaormCrud({ request, env, url });
            }

            if (normalizedPathname === '/api/shortlinks' && request.method === 'GET') {
                return handleShortlinksList({ request, env, url });
            }

            if (normalizedPathname === '/api/shortlinks' && request.method === 'POST') {
                return handleShortlinksCreate({ request, env, url });
            }

            const shortlinkUpdateMatch = normalizedPathname.match(/^\/api\/shortlinks\/(.+)$/);
            if (shortlinkUpdateMatch && shortlinkUpdateMatch[1]) {
                const id = shortlinkUpdateMatch[1];
                if (request.method === 'PATCH') {
                    return handleShortlinkById({ request, env, url }, id, 'PATCH');
                }
                if (request.method === 'DELETE') {
                    return handleShortlinkById({ request, env, url }, id, 'DELETE');
                }
            }

            if (normalizedPathname === '/api/referrals/track' && request.method === 'POST') {
                return handleReferralTrack({ request, env, url });
            }

            if (normalizedPathname === '/api/referrals/stats' && request.method === 'GET') {
                return handleReferralStats({ request, env, url });
            }

            if (normalizedPathname === '/api/referrals/user' && request.method === 'GET') {
                return handleReferralUser({ request, env, url });
            }

            if (normalizedPathname === '/api/referrals/username' && request.method === 'PUT') {
                return handleReferralUsernameUpdate({ request, env, url });
            }

            if (normalizedPathname === '/api/referrals/tracking' && request.method === 'GET') {
                return handleReferralTrackingList({ request, env, url });
            }

            if (normalizedPathname === '/api/auth/register' && request.method === 'POST') {
                return handleAuthRegister({ request, env, url, withAuthCors });
            }

            if (normalizedPathname.startsWith('/api/auth/')) {
                return handleAuthJsRequest({ request, env, url, withAuthCors });
            }

            if (normalizedPathname === '/api/demo') {
                return handleDemo({ request, env, url });
            }

            if (normalizedPathname === '/api/audit/logs' && request.method === 'GET') {
                return handleAuditLogs({ request, env, url });
            }

            if (normalizedPathname === '/api/demo/error') {
                return handleDemoError();
            }

            if (normalizedPathname === '/api/cloudflare/kv') {
                return handleCloudflareKV({ request, env, url });
            }

            if (normalizedPathname === '/api/cloudflare/r2') {
                return handleCloudflareR2({ request, env, url });
            }

            if (normalizedPathname === '/api/upload') {
                return handleUpload({ request, env, url });
            }

            if (normalizedPathname.startsWith('/api/upload/file/')) {
                return handleUploadFile({ request, env, url });
            }

            if (normalizedPathname === '/api/cloudflare/images') {
                return handleCloudflareImages({ request, env, url });
            }

            if (normalizedPathname === '/api/cloudflare/d1/init' && request.method === 'POST') {
                return handleD1Init({ request, env, url });
            }

            if (normalizedPathname === '/api/cloudflare/d1/todos') {
                return handleD1Todos({ request, env, url });
            }

            const d1TodoMatch = normalizedPathname.match(/^\/api\/cloudflare\/d1\/todos\/(.+)$/);
            if (d1TodoMatch && d1TodoMatch[1]) {
                const id = d1TodoMatch[1];
                if (request.method === 'PATCH' || request.method === 'DELETE') {
                    return handleD1TodoById({ request, env, url }, id, request.method as 'PATCH' | 'DELETE');
                }
            }

            if (normalizedPathname === '/api/cloudflare/queues') {
                return handleCloudflareQueue({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues' && request.method === 'GET') {
                return handleAdminQueuesOverview({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/processed' && request.method === 'GET') {
                return handleAdminQueuesProcessed({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/failed' && request.method === 'GET') {
                return handleAdminQueuesFailed({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/pending' && request.method === 'GET') {
                return handleAdminQueuesPending({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/reset-stats' && request.method === 'POST') {
                return handleAdminQueuesResetStats({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/dlq' && request.method === 'GET') {
                return handleAdminQueuesDLQList({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/dlq/retry-all' && request.method === 'POST') {
                return handleAdminQueuesDLQRetryAll({ request, env, url });
            }

            if (normalizedPathname === '/api/admin/queues/dlq' && request.method === 'DELETE') {
                return handleAdminQueuesDLQPurge({ request, env, url });
            }

            const dlqJobMatch = url.pathname.match(/^\/api\/admin\/queues\/dlq\/([^/]+)$/);
            if (dlqJobMatch && dlqJobMatch[1]) {
                return handleAdminQueuesDLQJob({ request, env, url }, dlqJobMatch[1]);
            }

            const dlqRetryMatch = url.pathname.match(/^\/api\/admin\/queues\/dlq\/([^/]+)\/retry$/);
            if (dlqRetryMatch && request.method === 'POST') {
                return handleAdminQueuesDLQRetryJob({ request, env, url }, dlqRetryMatch[1]);
            }

            if (normalizedPathname === '/api/cloudflare/rate-limiting' && request.method === 'POST') {
                return handleRateLimiting({ request, env });
            }

            if (normalizedPathname === '/api/cloudflare/realtime/ws') {
                return handleRealtimeWebsocket({ request, env });
            }

            if (normalizedPathname === '/api/cloudflare/realtime/broadcast' && request.method === 'POST') {
                return handleRealtimeBroadcast({ request, env });
            }

            if (normalizedPathname === '/api/cloudflare/realtime/stats' && request.method === 'GET') {
                return handleRealtimeStats({ request, env });
            }

            if (normalizedPathname === '/api/ottaorm/models-metadata' && request.method === 'GET') {
                return handleModelsMetadata();
            }

            if (normalizedPathname === '/api/ottaorm/init' && (request.method === 'GET' || request.method === 'POST')) {
                return handleOttaormInit({ request, env });
            }

            if (normalizedPathname === '/shortlinks/go') {
                return handleShortlinkExplicitGo({ request, env, url });
            }

            const shortlinkFallbackResponse = await handleShortlinkFallback({ request, env, url });
            if (shortlinkFallbackResponse) {
                return shortlinkFallbackResponse;
            }

            if (!env.OBCF_ASSETS) {
                return errorResponse('Assets binding not configured', 500, {
                    code: 'CONFIG_ERROR',
                });
            }

            const response = await env.OBCF_ASSETS.fetch(request);

            if (isHtmlRequest(request)) {
                if (response.status === 404 || SPA_REDIRECT_STATUSES.has(response.status)) {
                    const indexUrl = new URL(request.url);
                    indexUrl.pathname = '/index.html';
                    return env.OBCF_ASSETS.fetch(new Request(indexUrl.toString(), request));
                }
            }

            if (url.pathname === '/api/admin/db/tables' && request.method === 'GET') {
                return handleAdminDbTables({ request, env, url });
            }

            const dbTableMatch = url.pathname.match(/^\/api\/admin\/db\/tables\/([a-zA-Z0-9_]+)$/);
            if (dbTableMatch) {
                const tableName = dbTableMatch[1];
                if (request.method === 'GET') {
                    return handleAdminDbTableData({ request, env, url, tableName });
                }
                if (request.method === 'DELETE') {
                    return handleAdminDbTableDelete({ request, env, url, tableName });
                }
            }

            const dbRowDeleteMatch = url.pathname.match(/^\/api\/admin\/db\/tables\/([a-zA-Z0-9_]+)\/(.+)$/);
            if (dbRowDeleteMatch && request.method === 'DELETE') {
                const tableName = dbRowDeleteMatch[1];
                const rowId = dbRowDeleteMatch[2];
                const pkField = url.searchParams.get('pk') || 'id';
                return handleAdminDbRowDelete({ request, env, url, tableName }, rowId, pkField);
            }

            return errorResponse('Not found', 404);
        } catch (err) {
            console.error('Worker unhandled error:', err);

            if (err instanceof ServiceError) {
                return errorResponse(err.message, err.status, err.toApiResponse());
            }

            return errorResponse(err instanceof Error ? err.message : 'An unexpected error occurred', 500, {
                code: 'INTERNAL_SERVER_ERROR',
            });
        }
    },
    queue: queueHandler,
};
