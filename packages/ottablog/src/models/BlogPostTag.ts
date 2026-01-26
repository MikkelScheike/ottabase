/**
 * BlogPostTag Model
 *
 * Junction table for blog posts and tags.
 */
import { BaseModel } from "@ottabase/ottaorm";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { postsTable } from "./BlogPost";
import { tagsTable } from "./BlogTag";

/**
 * Post-Tags junction table for many-to-many relationship
 */
export const postTagsTable = sqliteTable(
  "blog_post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),

    tagId: text("tag_id")
      .notNull()
      .references(() => tagsTable.id, { onDelete: "cascade" }),

    // When the tag was added
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("blog_post_tags_post_id_idx").on(table.postId),
    index("blog_post_tags_tag_id_idx").on(table.tagId),
  ],
);

export type PostTag = typeof postTagsTable.$inferSelect;
export type NewPostTag = typeof postTagsTable.$inferInsert;

export class BlogPostTag extends BaseModel {
  static entity = "blog_post_tags";
  static table = postTagsTable;
  static primaryKey = "postId";
}
