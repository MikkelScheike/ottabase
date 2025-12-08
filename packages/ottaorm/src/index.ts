// ============================================================
// @ottabase/ottaorm - Main Exports
// ============================================================

// Context (for global driver management)
export { setDriver, getDriver, clearDriver, hasDriver } from "./context";

// Migrations
export { runMigrations, rollbackMigrations, coreMigrations } from "./migrations";
export type { Migration } from "./migrations";

// Base model
export { BaseModel } from "./base/BaseModel";
export type {
  IModelConstructorParams,
  ModelFieldType,
  ModelFieldDescriptor,
  ModelFields,
  PaginationResult
} from "./base/BaseModel";

// Core models
export {
  User,
  usersTable,
  Account,
  accountsTable,
  Post,
  postsTable,
  postTagsTable,
  Tag,
  tagsTable,
} from "./models";
export type {
  UserType,
  NewUserType,
  AccountType,
  NewAccountType,
  PostType,
  NewPostType,
  TagType,
  NewTagType,
} from "./models";
