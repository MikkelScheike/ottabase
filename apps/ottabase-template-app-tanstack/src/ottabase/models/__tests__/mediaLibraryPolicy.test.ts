import { describe, expect, it } from 'vitest';
import { buildMediaLibraryAccessFilter } from '../../../../ottabase/models/mediaLibraryPolicy';

describe('mediaLibraryPolicy', () => {
    it('limits non-admin users to their own uploads', () => {
        const filter = buildMediaLibraryAccessFilter({
            appId: 'app-1',
            organizationId: 'org-1',
            userId: 'user-1',
            roles: ['user'],
            permissions: ['posts:read'],
        });

        expect(filter).toEqual({
            appId: 'app-1',
            organizationId: 'org-1',
            userId: 'user-1',
        });
    });

    it('allows admins to browse all uploads in the current scope', () => {
        const filter = buildMediaLibraryAccessFilter({
            appId: 'app-1',
            organizationId: 'org-1',
            userId: 'admin-1',
            roles: ['admin'],
            permissions: ['*:*'],
        });

        expect(filter).toEqual({
            appId: 'app-1',
            organizationId: 'org-1',
        });
    });

    it('denies access when app scope is missing', () => {
        expect(
            buildMediaLibraryAccessFilter({
                userId: 'user-1',
            }),
        ).toBeNull();
    });
});
