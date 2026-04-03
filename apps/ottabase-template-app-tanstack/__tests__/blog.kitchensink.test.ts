import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    findBySlugMock: vi.fn(),
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
        create: mocks.createMock,
    },
}));

import { handleBlogKitchensink } from '../worker/routes/blog';

function makeContext() {
    return {
        request: new Request('http://localhost/api/blog/kitchensink', { method: 'POST' }),
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
        mocks.requireAdminAccessMock.mockResolvedValue({ user: { id: 'admin' } });
        mocks.findBySlugMock.mockResolvedValueOnce(null);
        mocks.createMock.mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'id') return 'post-1';
                if (key === 'slug') return 'kitchensink-ottablog';
                return null;
            },
        });

        const res = await handleBlogKitchensink(makeContext());

        expect(res.status).toBe(200);
        expect(mocks.createMock).toHaveBeenCalledTimes(1);

        const createPayload = mocks.createMock.mock.calls[0][0] as {
            content: { blocks: Array<{ type: string }> };
        };
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
