// ============================================================
// @ottabase/ottaorm - Session table schema for Auth.js
// ============================================================

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Session table schema for Auth.js
 */
export const sessionsTable = sqliteTable('sessions', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    sessionToken: text('session_token').notNull().unique(),
    userId: text('user_id').notNull(),
    expires: text('expires').notNull(), // ISO 8601 date string
    // App identifier for multi-app database sharing (nullable, opt-in)
    appId: text('app_id'),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .$defaultFn(() => new Date())
        .$onUpdateFn(() => new Date())
        .notNull(),
});

/**
 * Session model type
 */
export type SessionType = typeof sessionsTable.$inferSelect;
export type NewSessionType = typeof sessionsTable.$inferInsert;
