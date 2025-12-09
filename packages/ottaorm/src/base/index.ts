// ============================================================
// @ottabase/ottaorm - Base Model Exports
// ============================================================

// Abstract base (shared functionality)
export { AbstractBaseModel } from './AbstractBaseModel';

// SQL base model
export { BaseModel } from './BaseModel';
export type { IModelConstructorParams } from './BaseModel';

// MongoDB base model
export { MongoBaseModel } from './MongoBaseModel';
export type { IMongoModelConstructorParams } from './MongoBaseModel';

// Shared types
export type {
  ModelFieldType,
  ModelFieldDescriptor,
  ModelFields,
  PaginationResult
} from './AbstractBaseModel';
