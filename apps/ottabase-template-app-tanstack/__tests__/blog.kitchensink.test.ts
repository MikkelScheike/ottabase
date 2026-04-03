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

    it('returns exists on unique-race create failure for idempotent behavior', async () => {
        mocks.requireAdminAccessMock.mockResolvedValue({ user: { id: 'admin' } });

        mocks.findBySlugMock.mockResolvedValueOnce(null).mockResolvedValueOnce({
            get: (key: string) => {
                if (key === 'id') return 'post-1';
                if (key === 'slug') return 'kitchensink-ottablog';
                return null;
            },
        });

        mocks.createMock.mockRejectedValueOnce(new Error('UNIQUE constraint failed: posts.slug'));

        const res = await handleBlogKitchensink(makeContext());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.status).toBe('exists');
        expect(body.slug).toBe('kitchensink-ottablog');
    });

    it('publishes an existing draft kitchensink post so public blog url works', async () => {
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
        expect(body.status).toBe('published');
        expect(body.slug).toBe('kitchensink-ottablog');
        expect(setMock).toHaveBeenCalledWith('status', 'published');
        expect(setMock).toHaveBeenCalledWith('publishedAt', expect.any(String));
        expect(saveMock).toHaveBeenCalled();
    });
});
