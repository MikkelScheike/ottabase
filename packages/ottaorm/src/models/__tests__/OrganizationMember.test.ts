import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';
import { OrganizationMember } from '../OrganizationMember';
import { organizationMembersTable } from '../OrganizationMember.schema';

const indexNames = (table: unknown) =>
    Object.values(getTableConfig(table as any).indexes as any).map((i: any) => (i?.config ?? i)?.name);

describe('OrganizationMember unified membership shape', () => {
    it('uses a single `id` primary key (not the old composite key)', () => {
        expect(OrganizationMember.primaryKey).toBe('id');
        const pkCols = getTableConfig(organizationMembersTable)
            .columns.filter((c) => c.primary)
            .map((c) => c.name);
        expect(pkCols).toEqual(['id']);
    });

    it('enforces one membership per user and one invite per email, within an org', () => {
        const names = indexNames(organizationMembersTable);
        expect(names).toContain('organization_members_org_user_unique');
        expect(names).toContain('organization_members_org_email_unique');
    });

    it('supports email-first invites (nullable user_id + invited_email column)', () => {
        const cols = getTableConfig(organizationMembersTable).columns;
        expect(cols.find((c) => c.name === 'user_id')?.notNull).toBe(false); // null until the invite is accepted
        expect(cols.find((c) => c.name === 'invited_email')).toBeDefined();
        // joinedAt is now stamped on activation, so it is nullable for pending invites.
        expect(cols.find((c) => c.name === 'joined_at')?.notNull).toBe(false);
    });
});
