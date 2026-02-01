// ============================================================
// @ottabase/ottaorm - VerificationToken table schema for Auth.js
// ============================================================

import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * VerificationToken table schema for Auth.js
 * Composite primary key: (identifier, token)
 */
export const verificationTokensTable = sqliteTable(
    'verification_tokens',
    {
        identifier: text('identifier').notNull(), // email or other identifier
        token: text('token').notNull(),
        expires: text('expires').notNull(), // ISO 8601 date string
        // App identifier for multi-app database sharing (nullable, opt-in)
        appId: text('app_id'),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.identifier, table.token] }),
    }),
);

/**
 * VerificationToken model type
 */
export type VerificationTokenType = typeof verificationTokensTable.$inferSelect;
export type NewVerificationTokenType = typeof verificationTokensTable.$inferInsert;
