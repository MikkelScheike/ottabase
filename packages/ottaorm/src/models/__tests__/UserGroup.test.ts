import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserGroup, UserGroupMember } from '../UserGroup';
import { userGroupMembersTable, userGroupsTable } from '../UserGroup.schema';

/** Minimal stand-in for a model instance (only `get` is exercised by these methods). */
function fakeRecord(data: Record<string, unknown>) {
    return { get: (key: string) => data[key] } as any;
}

const indexNames = (table: unknown) =>
    Object.values(getTableConfig(table as any).indexes as any).map((i: any) => (i?.config ?? i)?.name);

describe('UserGroup.groupIdsForUser', () => {
    afterEach(() => vi.restoreAllMocks());

    it('returns empty for a missing userId without querying', async () => {
        const memberSpy = vi.spyOn(UserGroupMember, 'where');
        expect(await UserGroup.groupIdsForUser('')).toEqual([]);
        expect(memberSpy).not.toHaveBeenCalled();
    });

    it('unions active memberships with created groups, de-duplicated', async () => {
        vi.spyOn(UserGroupMember, 'where').mockResolvedValue([
            fakeRecord({ groupId: 'g1' }),
            fakeRecord({ groupId: 'g2' }),
        ] as any);
        vi.spyOn(UserGroup, 'where').mockResolvedValue([
            fakeRecord({ id: 'g2' }), // also created -> de-duplicated against the membership
            fakeRecord({ id: 'g3' }), // created but not a member -> still accessible
        ] as any);

        const ids = await UserGroup.groupIdsForUser('u1');
        expect([...ids].sort()).toEqual(['g1', 'g2', 'g3']);
    });
});

describe('UserGroupMember role helpers', () => {
    afterEach(() => vi.restoreAllMocks());

    it('getRole returns the active member role, null otherwise', async () => {
        const spy = vi.spyOn(UserGroupMember, 'where');

        spy.mockResolvedValueOnce([fakeRecord({ role: 'manager' })] as any);
        expect(await UserGroupMember.getRole('g1', 'u1')).toBe('manager');

        spy.mockResolvedValueOnce([] as any);
        expect(await UserGroupMember.getRole('g1', 'u2')).toBeNull();
    });

    it('hasRole compares against the active role', async () => {
        vi.spyOn(UserGroupMember, 'where').mockResolvedValue([fakeRecord({ role: 'member' })] as any);
        expect(await UserGroupMember.hasRole('g1', 'u1', 'member')).toBe(true);
        expect(await UserGroupMember.hasRole('g1', 'u1', 'manager')).toBe(false);
    });

    it('isMember is true only when an active row exists', async () => {
        const spy = vi.spyOn(UserGroupMember, 'where');
        spy.mockResolvedValueOnce([fakeRecord({})] as any);
        expect(await UserGroupMember.isMember('g1', 'u1')).toBe(true);
        spy.mockResolvedValueOnce([] as any);
        expect(await UserGroupMember.isMember('g1', 'u2')).toBe(false);
    });
});

describe('UserGroup schema integrity', () => {
    it('user_groups enforces a unique slug per organization + app', () => {
        expect(indexNames(userGroupsTable)).toContain('user_groups_org_app_slug_unique');
    });

    it('user_group_members enforces one row per user and per invited email within a group', () => {
        const names = indexNames(userGroupMembersTable);
        expect(names).toContain('user_group_members_group_user_unique');
        expect(names).toContain('user_group_members_group_email_unique');
    });
});
