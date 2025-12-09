// ============================================================
// @ottabase/ottaorm - Main Exports
// ============================================================

// Connection management (multi-database support)
export {
  registerConnection,
  getConnection,
  hasConnection,
  clearConnection,
  clearAllConnections
} from "./context";

// Migrations
export { runMigrations, rollbackMigrations, coreMigrations } from "./migrations";
export type { Migration } from "./migrations";

// Base models
export {
  AbstractBaseModel,
  BaseModel,
  MongoBaseModel
} from "./base";
export type {
  IModelConstructorParams,
  IMongoModelConstructorParams,
  ModelFieldType,
  ModelFieldDescriptor,
  ModelFields,
  PaginationResult
} from "./base";

// Core models
export {
  // SQL models
  User,
  usersTable,
  Account,
  accountsTable,
  Post,
  postsTable,
  postTagsTable,
  Tag,
  tagsTable,
  // MongoDB models
  Log,
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
