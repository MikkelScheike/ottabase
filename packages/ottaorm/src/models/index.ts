// ============================================================
// @ottabase/ottaorm - Models Export
// ============================================================

// Core models - Fat Model Pattern
export { User, usersTable, type UserType, type NewUserType } from "./User";
export { Account, accountsTable, type AccountType, type NewAccountType } from "./Account";
export { Post, postsTable, postTagsTable, type PostType, type NewPostType } from "./Post";
export { Tag, tagsTable, type TagType, type NewTagType } from "./Tag";
