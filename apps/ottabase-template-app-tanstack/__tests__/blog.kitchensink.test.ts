import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    findBySlugMock: vi.fn(),
    firstMock: vi.fn(),
    createMock: vi.fn(),
    requireAdminAccessMock: vi.fn(),
}));

vi.mock('../worker/lib/admin-guard', () => ({
    requireAdminAccess: mocks.requireAdminAccessMock,
}));

vi.mock('@ottabase/db/drizzle-d1', () => ({
    createD1Driver: vi.fn(() => ({})),
}));

vi.mock('@ottabase/ottaorm', () => ({
    registerConnection: vi.fn(),
}));

vi.mock('@ottabase/ottablog', () => ({
    OttablogPlugin: class {},
    OttablogTheme: class {},
    PostCategory: class {},
    PostCategoryLink: class {},
    PostSeries: class {},
    PostTag: class {},
    PostTagLink: class {},
    StudioManager: class {},
    Post: {
        findBySlug: mocks.findBySlugMock,
        first: mocks.firstMock,
        create: mocks.createMock,
    },
}));

import { handleBlogKitchensink, handleBlogPostBySlug, handleBlogPostUnlock } from '../worker/routes/blog';

function makeContext(headers?: Record<string, string>) {
    return {
        request: new Request('http://localhost/api/blog/kitchensink', { method: 'POST', headers }),
        url: new URL('http://localhost/api/blog/kitchensink'),
        env: {
            OBCF_D1: {},
        },
        route: '/api/blog/kitchensink',
        method: 'POST',
        withAuthCors: (response: Response) => response,
        corsHeaders: {},
    } as any;
}

describe('handleBlogKitchensink', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns admin guard response when caller is unauthorized', async () => {
        mocks.requireAdminAccessMock.mockResolvedValue(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }),
        );

        const res = await handleBlogKitchensink(makeContext());

        expect(mocks.requireAdminAccessMock).toHaveBeenCalled();
        expect(res.status).toBe(401);
    });

    it('upserts on unique-race create failure for idempotent behavior', async () => {
        mocks.requireAdminAccessMock.mockResolvedValue({ user: { id: 'admin' } });

        const saveMock = vi.fn().mockResolvedValue(undefined);
        const setMock = vi.fn();
        mocks.findBySlugMock.mockResolvedValueOnce(null).mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'id') return 'post-1';
                if (key === 'slug') return 'kitchensink-ottablog';
                if (key === 'publishedAt') return null;
                return null;
            },
            set: setMock,
            save: saveMock,
        });

        mocks.createMock.mockRejectedValueOnce(new Error('UNIQUE constraint failed: posts.slug'));

        const res = await handleBlogKitchensink(makeContext());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.status).toBe('upserted');
        expect(body.slug).toBe('kitchensink-ottablog');
        expect(setMock).toHaveBeenCalledWith('content', expect.any(Object));
        expect(saveMock).toHaveBeenCalled();
    });

    it('upserts an existing kitchensink post so public blog url always works', async () => {
        mocks.requireAdminAccessMock.mockResolvedValue({ user: { id: 'admin' } });

        const saveMock = vi.fn().mockResolvedValue(undefined);
        const setMock = vi.fn();
        mocks.findBySlugMock.mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'id') return 'post-1';
                if (key === 'slug') return 'kitchensink-ottablog';
                if (key === 'status') return 'draft';
                if (key === 'publishedAt') return null;
                return null;
            },
            set: setMock,
            save: saveMock,
        });

        const res = await handleBlogKitchensink(makeContext());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.status).toBe('upserted');
        expect(body.slug).toBe('kitchensink-ottablog');
        expect(setMock).toHaveBeenCalledWith('status', 'published');
        expect(setMock).toHaveBeenCalledWith('content', expect.any(Object));
        expect(setMock).toHaveBeenCalledWith('publishedAt', expect.any(String));
        expect(saveMock).toHaveBeenCalled();
    });

    it('seeds extended kitchensink blocks for full plugin coverage', async () => {
        mocks.requireAdminAccessMock.mockResolvedValue({ user: { id: 'admin' }, session: { user: { id: 'admin' } } });
        mocks.findBySlugMock.mockResolvedValueOnce(null);
        mocks.createMock.mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'id') return 'post-1';
                if (key === 'slug') return 'kitchensink-ottablog';
                return null;
            },
        });

        const res = await handleBlogKitchensink(makeContext({ 'x-app-id': 'site-a', 'x-org-id': 'org-123' }));

        expect(res.status).toBe(200);
        expect(mocks.createMock).toHaveBeenCalledTimes(1);
        expect(mocks.findBySlugMock).toHaveBeenCalledWith('kitchensink-ottablog', { appId: 'site-a' });

        const createPayload = mocks.createMock.mock.calls[0][0] as {
            appId: string;
            organizationId: string;
            userId: string;
            content: { blocks: Array<{ type: string }> };
        };
        expect(createPayload.appId).toBe('site-a');
        expect(createPayload.organizationId).toBe('org-123');
        expect(createPayload.userId).toBe('admin');
        const blockTypes = createPayload.content.blocks.map((block) => block.type);

        expect(blockTypes).toEqual(
            expect.arrayContaining([
                'advancedImage',
                'embed',
                'raw',
                'beforeAfter',
                'map',
                'mediaEmbed',
                'imageHotspots',
                'layout',
                'mediaGallery',
                'references',
            ]),
        );
    });
});

describe('blog post app scoping by slug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('scopes by-slug reads to x-app-id header', async () => {
        mocks.firstMock.mockResolvedValueOnce({
            get: (key: string) => (key === 'contentType' ? 'blog' : null),
            toJson: () => ({
                id: 'post-1',
                slug: 'kitchensink-ottablog',
                title: 'The Kitchensink of Ottablog',
                isProtected: false,
                content: { blocks: [] },
                footnotes: null,
            }),
        });

        const context = {
            request: new Request('http://localhost/api/blog/posts/by-slug/kitchensink-ottablog', {
                headers: { 'x-app-id': 'site-a' },
            }),
            url: new URL('http://localhost/api/blog/posts/by-slug/kitchensink-ottablog'),
            env: { OBCF_D1: {} },
        } as any;

        const res = await handleBlogPostBySlug(context, 'kitchensink-ottablog');

        expect(res.status).toBe(200);
        expect(mocks.firstMock).toHaveBeenCalledWith({
            slug: 'kitchensink-ottablog',
            status: 'published',
            appId: 'site-a',
        });
    });

    it('scopes unlock reads to appId query param before header', async () => {
        mocks.firstMock.mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'contentType') return 'blog';
                if (key === 'isProtected') return false;
                if (key === 'passwordHash') return null;
                return null;
            },
            toJson: () => ({
                id: 'post-1',
                slug: 'kitchensink-ottablog',
                title: 'The Kitchensink of Ottablog',
                isProtected: false,
                content: { blocks: [] },
                footnotes: null,
            }),
        });

        const context = {
            request: new Request('http://localhost/api/blog/posts/unlock?appId=site-b', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-app-id': 'site-a',
                },
                body: JSON.stringify({ slug: 'kitchensink-ottablog', password: 'ignored' }),
            }),
            url: new URL('http://localhost/api/blog/posts/unlock?appId=site-b'),
            env: { OBCF_D1: {} },
        } as any;

        const res = await handleBlogPostUnlock(context);

        expect(res.status).toBe(200);
        expect(mocks.firstMock).toHaveBeenCalledWith({
            slug: 'kitchensink-ottablog',
            status: 'published',
            appId: 'site-b',
        });
    });
});
