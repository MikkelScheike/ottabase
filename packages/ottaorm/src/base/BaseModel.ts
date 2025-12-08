// ============================================================
// @ottabase/ottaorm - Base Model (Fat Model Pattern)
// ============================================================
// Inspired by Laravel Eloquent - everything in one place
// ============================================================

import { getDriver } from "../context";
import type { DbDriver } from "@ottabase/db/drizzle";
import { eq, and, or, desc, asc, like, gt, lt, gte, lte, inArray } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

export interface IModelConstructorParams {
  entity: string;
  data: { [key: string]: any };
}

export type ModelFieldType = 'string' | 'number' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean' | 'id' | 'json' | 'array';

export interface ModelFieldDescriptor {
  type: ModelFieldType;
  primaryKey?: boolean;
  unique?: boolean;
  editable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  uiConfig?: {
    label?: string;
    description?: string;
    placeholder?: string;
    hint?: string;
    defaultValue?: any;
  };
  formConfig?: {
    fieldType?: 'input' | 'textarea' | 'select' | 'multiselect' | 'date' | 'datetime' | 'json' | 'boolean' | 'number' | 'hidden';
    visible?: boolean;
    order?: number;
  };
  tableConfig?: {
    visible?: boolean;
    order?: number;
    colWidth?: string | number;
  };
  validation?: Record<string, any>;
}

export type ModelFields = {
  [key: string]: ModelFieldDescriptor;
};

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Base Model class - Fat Model Pattern
 *
 * All metadata lives in the model class as static properties:
 * - entity: table name
 * - table: Drizzle table definition
 * - primaryKey: primary key field name
 * - casts: type casting rules
 * - connect: relationship definitions
 * - with: default eager loading
 * - fields: complete field metadata
 * - validationRules: validation rules
 * - defaults: default values
 *
 * @example
 * ```typescript
 * export class Post extends BaseModel {
 *   static entity = "posts";
 *   static table = postsTable;
 *   static primaryKey = "id";
 *
 *   static casts = {
 *     createdAt: 'date',
 *     published: 'boolean'
 *   };
 *
 *   static connect = [
 *     'author:id{name,email}',
 *     'tags[]:id{name,slug}>join:tag,model:Tag'
 *   ];
 *
 *   static fields: ModelFields = {
 *     title: {
 *       type: 'string',
 *       searchable: true,
 *       uiConfig: { label: 'Title' }
 *     }
 *   };
 * }
 * ```
 */
export class BaseModel {

  // Static properties - model metadata
  static entity: string;
  static table: SQLiteTable;
  static primaryKey: string = "id";

  protected static casts: { [key: string]: ModelFieldType } = {};
  protected static connect: string[] = [];
  protected static with: string[] = [];
  protected static fields: ModelFields = {};
  protected static validationRules: any = {};
  protected static defaults: { [key: string]: any } = {};

  // Instance properties - actual data
  protected attributes: { [key: string]: any } = {};
  protected appends: string[] = [];
  protected hidden: string[] = [];

  constructor(params: IModelConstructorParams) {
    this.fill(params.data);
  }

  /**
   * Fill model with data and apply type casting
   */
  fill(data: { [key: string]: any }) {
    for (const key in data) {
      this.attributes[key] = this.castAttributeValue(key, data[key]);
    }
  }

  /**
   * Get attribute value
   */
  get(key: string): any {
    return this.attributes[key];
  }

  /**
   * Set attribute value with type casting
   */
  set(key: string, value: any): void {
    this.attributes[key] = this.castAttributeValue(key, value);
  }

  /**
   * Cast attribute value based on casts configuration
   */
  protected castAttributeValue(key: string, value: any): any {
    const casts = (this.constructor as typeof BaseModel).casts;
    const castType = casts[key];

    if (!castType || value === null || value === undefined) {
      return value;
    }

    // Skip if already correct type
    if (typeof value === castType ||
        (castType === 'number' && typeof value === 'number') ||
        (castType === 'integer' && Number.isInteger(value)) ||
        (castType === 'float' && typeof value === 'number' && !Number.isInteger(value))) {
      return value;
    }

    try {
      switch (castType) {
        case 'number':
        case 'integer':
          return parseInt(value);
        case 'float':
          return parseFloat(value);
        case 'string':
          return String(value);
        case 'boolean':
          if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
          }
          return Boolean(value);
        case 'date':
        case 'datetime':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date value for ${key}`);
          }
          return date;
        case 'json':
          return typeof value === 'string' ? JSON.parse(value) : value;
        case 'array':
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return value.split(/\s*,\s*/);
          return [value];
        default:
          return value;
      }
    } catch (e) {
      throw new Error(`Failed to cast ${key} with value: ${value} to type: ${castType}`);
    }
  }

  /**
   * Make hidden fields visible for this instance
   */
  makeVisible(fields: string | string[]): this {
    const fieldsToMakeVisible = Array.isArray(fields) ? fields : [fields];
    this.hidden = this.hidden.filter(attr => !fieldsToMakeVisible.includes(attr));
    return this;
  }

  /**
   * Convert to JSON, applying hidden fields and accessors
   */
  toJson(): Record<string, any> {
    const visibleAttributes: { [key: string]: any } = {};

    // Copy non-hidden attributes
    for (const key in this.attributes) {
      if (!this.hidden.includes(key)) {
        visibleAttributes[key] = this.attributes[key];
      }
    }

    // Apply accessors (appends)
    for (const appendKey of this.appends) {
      const accessorMethod = `get${appendKey.charAt(0).toUpperCase()}${appendKey.slice(1)}`;
      if (typeof (this as any)[accessorMethod] === 'function') {
        visibleAttributes[appendKey] = (this as any)[accessorMethod]();
      }
    }

    return visibleAttributes;
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return (this.constructor as typeof BaseModel).entity;
  }

  // ============================================================
  // STATIC QUERY METHODS
  // ============================================================

  /**
   * Get table definition
   */
  protected static getTable(): SQLiteTable {
    if (!this.table) {
      throw new Error(`Table not defined for ${this.entity}`);
    }
    return this.table;
  }

  /**
   * Get database driver
   */
  protected static getDriver(driver?: DbDriver): DbDriver {
    return driver || getDriver();
  }

  /**
   * Find record by primary key
   */
  static async find<T extends typeof BaseModel>(
    this: T,
    id: string | number,
    driver?: DbDriver
  ): Promise<InstanceType<T> | null> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();
    const pkColumn = (table as any)[this.primaryKey];

    if (!pkColumn) {
      throw new Error(`Primary key column ${this.primaryKey} not found in table ${this.entity}`);
    }

    const results = await db
      .select()
      .from(table)
      .where(eq(pkColumn, id))
      .limit(1);

    if (results.length === 0) return null;

    return new this({ entity: this.entity, data: results[0] }) as InstanceType<T>;
  }

  /**
   * Get first record matching conditions
   */
  static async first<T extends typeof BaseModel>(
    this: T,
    where?: Record<string, any>,
    driver?: DbDriver
  ): Promise<InstanceType<T> | null> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();

    let query = db.select().from(table);

    if (where) {
      const conditions = this.buildWhereConditions(where);
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const results = await query.limit(1);

    if (results.length === 0) return null;

    return new this({ entity: this.entity, data: results[0] }) as InstanceType<T>;
  }

  /**
   * Get all records matching conditions
   */
  static async where<T extends typeof BaseModel>(
    this: T,
    where: Record<string, any>,
    options?: { orderBy?: string; orderDirection?: 'asc' | 'desc'; limit?: number; offset?: number },
    driver?: DbDriver
  ): Promise<InstanceType<T>[]> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();

    let query = db.select().from(table);

    // Apply where conditions
    const conditions = this.buildWhereConditions(where);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering
    if (options?.orderBy) {
      const orderColumn = (table as any)[options.orderBy];
      if (orderColumn) {
        query = query.orderBy(
          options.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)
        );
      }
    }

    // Apply limit/offset
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query;

    return results.map((row: any) => new this({ entity: this.entity, data: row }) as InstanceType<T>);
  }

  /**
   * Get all records
   */
  static async all<T extends typeof BaseModel>(
    this: T,
    options?: { orderBy?: string; orderDirection?: 'asc' | 'desc'; limit?: number; offset?: number },
    driver?: DbDriver
  ): Promise<InstanceType<T>[]> {
    return this.where({}, options, driver);
  }

  /**
   * Build where conditions for Drizzle
   */
  protected static buildWhereConditions(where: Record<string, any>): any[] {
    const table = this.getTable();
    const conditions: any[] = [];

    for (const [key, value] of Object.entries(where)) {
      const column = (table as any)[key];
      if (!column) continue;

      if (value === null) {
        continue; // Skip null values
      }

      conditions.push(eq(column, value));
    }

    return conditions;
  }

  /**
   * Create a new record
   */
  static async create<T extends typeof BaseModel>(
    this: T,
    data: Record<string, any>,
    driver?: DbDriver
  ): Promise<InstanceType<T>> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();

    // Merge with defaults
    const createData = { ...this.defaults, ...data };

    const result = await db.insert(table).values(createData).returning();

    if (result.length === 0) {
      throw new Error(`Failed to create ${this.entity}`);
    }

    return new this({ entity: this.entity, data: result[0] }) as InstanceType<T>;
  }

  /**
   * Update a record by primary key
   */
  static async update<T extends typeof BaseModel>(
    this: T,
    id: string | number,
    data: Record<string, any>,
    driver?: DbDriver
  ): Promise<InstanceType<T>> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();
    const pkColumn = (table as any)[this.primaryKey];

    if (!pkColumn) {
      throw new Error(`Primary key column ${this.primaryKey} not found`);
    }

    const result = await db
      .update(table)
      .set(data)
      .where(eq(pkColumn, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Failed to update ${this.entity} with id ${id}`);
    }

    return new this({ entity: this.entity, data: result[0] }) as InstanceType<T>;
  }

  /**
   * Delete a record by primary key
   */
  static async delete(
    id: string | number,
    driver?: DbDriver
  ): Promise<boolean> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();
    const pkColumn = (table as any)[this.primaryKey];

    if (!pkColumn) {
      throw new Error(`Primary key column ${this.primaryKey} not found`);
    }

    await db.delete(table).where(eq(pkColumn, id));

    return true;
  }

  /**
   * Count records matching conditions
   */
  static async count(
    where?: Record<string, any>,
    driver?: DbDriver
  ): Promise<number> {
    const db = this.getDriver(driver).getDb();
    const table = this.getTable();

    let query = db.select().from(table);

    if (where) {
      const conditions = this.buildWhereConditions(where);
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const results = await query;
    return results.length;
  }

  /**
   * Paginate results
   */
  static async paginate<T extends typeof BaseModel>(
    this: T,
    page: number = 1,
    perPage: number = 15,
    where?: Record<string, any>,
    options?: { orderBy?: string; orderDirection?: 'asc' | 'desc' },
    driver?: DbDriver
  ): Promise<PaginationResult<InstanceType<T>>> {
    const offset = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.where(where || {}, { ...options, limit: perPage, offset }, driver),
      this.count(where, driver)
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      total,
      page,
      perPage,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  // ============================================================
  // INSTANCE METHODS
  // ============================================================

  /**
   * Save instance (create or update)
   */
  async save(driver?: DbDriver): Promise<this> {
    const ModelClass = this.constructor as typeof BaseModel;
    const pk = this.get(ModelClass.primaryKey);

    if (pk) {
      // Update existing
      const updated = await ModelClass.update(pk, this.attributes, driver);
      this.fill(updated.attributes);
    } else {
      // Create new
      const created = await ModelClass.create(this.attributes, driver);
      this.fill(created.attributes);
    }

    return this;
  }

  /**
   * Delete instance
   */
  async destroy(driver?: DbDriver): Promise<boolean> {
    const ModelClass = this.constructor as typeof BaseModel;
    const pk = this.get(ModelClass.primaryKey);

    if (!pk) {
      throw new Error('Cannot delete record without primary key');
    }

    return ModelClass.delete(pk, driver);
  }

  /**
   * Reload instance from database
   */
  async refresh(driver?: DbDriver): Promise<this> {
    const ModelClass = this.constructor as typeof BaseModel;
    const pk = this.get(ModelClass.primaryKey);

    if (!pk) {
      throw new Error('Cannot refresh record without primary key');
    }

    const fresh = await ModelClass.find(pk, driver);

    if (!fresh) {
      throw new Error(`Record not found: ${ModelClass.entity}#${pk}`);
    }

    this.fill(fresh.attributes);
    return this;
  }

  // ============================================================
  // RELATIONSHIP HELPERS (Instance Methods)
  // ============================================================

  /**
   * BelongsTo relationship (many-to-one)
   *
   * @example
   * ```typescript
   * // Simple (auto-selects all fields)
   * async author() {
   *   return this.belongsTo(User, 'authorId');
   * }
   *
   * // With field selection (performance optimization)
   * async author() {
   *   return this.belongsTo(User, 'authorId', {
   *     select: ['id', 'name', 'email', 'image']
   *   });
   * }
   *
   * // Custom owner key (default is 'id')
   * async author() {
   *   return this.belongsTo(User, 'authorId', { ownerKey: 'uuid' });
   * }
   * ```
   */
  protected async belongsTo<T extends typeof BaseModel>(
    relatedModel: T,
    foreignKey: string,
    options?: {
      ownerKey?: string;      // Primary key in related model (default: relatedModel.primaryKey)
      select?: string[];      // Fields to select from related model
      driver?: DbDriver;
    }
  ): Promise<InstanceType<T> | null> {
    const foreignValue = this.get(foreignKey);

    if (!foreignValue) {
      return null;
    }

    const ownerKey = options?.ownerKey || relatedModel.primaryKey;
    const driver = options?.driver || getDriver();
    const db = driver.getDb();
    const table = relatedModel.getTable();

    let query = db.select().from(table);

    // Apply field selection if specified
    if (options?.select && options.select.length > 0) {
      const selectObj: any = {};
      for (const field of options.select) {
        const column = (table as any)[field];
        if (column) {
          selectObj[field] = column;
        }
      }
      query = db.select(selectObj).from(table);
    }

    const pkColumn = (table as any)[ownerKey];
    if (!pkColumn) {
      throw new Error(`Owner key ${ownerKey} not found in ${relatedModel.entity}`);
    }

    const results = await query.where(eq(pkColumn, foreignValue)).limit(1);

    if (results.length === 0) return null;

    return new relatedModel({ entity: relatedModel.entity, data: results[0] }) as InstanceType<T>;
  }

  /**
   * HasMany relationship (one-to-many)
   *
   * @example
   * ```typescript
   * // Simple
   * async comments() {
   *   return this.hasMany(Comment, 'postId');
   * }
   *
   * // With field selection
   * async comments() {
   *   return this.hasMany(Comment, 'postId', {
   *     select: ['id', 'content', 'createdAt']
   *   });
   * }
   *
   * // With ordering
   * async comments() {
   *   return this.hasMany(Comment, 'postId', {
   *     orderBy: 'createdAt',
   *     orderDirection: 'desc'
   *   });
   * }
   * ```
   */
  protected async hasMany<T extends typeof BaseModel>(
    relatedModel: T,
    foreignKey: string,
    options?: {
      localKey?: string;      // Primary key in this model (default: this.constructor.primaryKey)
      select?: string[];      // Fields to select from related model
      orderBy?: string;       // Field to order by
      orderDirection?: 'asc' | 'desc';
      limit?: number;         // Limit results
      driver?: DbDriver;
    }
  ): Promise<InstanceType<T>[]> {
    const ModelClass = this.constructor as typeof BaseModel;
    const localKey = options?.localKey || ModelClass.primaryKey;
    const localValue = this.get(localKey);

    if (!localValue) {
      return [];
    }

    const driver = options?.driver || getDriver();
    const db = driver.getDb();
    const table = relatedModel.getTable();

    let query = db.select().from(table);

    // Apply field selection if specified
    if (options?.select && options.select.length > 0) {
      const selectObj: any = {};
      for (const field of options.select) {
        const column = (table as any)[field];
        if (column) {
          selectObj[field] = column;
        }
      }
      query = db.select(selectObj).from(table);
    }

    const fkColumn = (table as any)[foreignKey];
    if (!fkColumn) {
      throw new Error(`Foreign key ${foreignKey} not found in ${relatedModel.entity}`);
    }

    query = query.where(eq(fkColumn, localValue));

    // Apply ordering
    if (options?.orderBy) {
      const orderColumn = (table as any)[options.orderBy];
      if (orderColumn) {
        query = query.orderBy(
          options.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)
        );
      }
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const results = await query;

    return results.map((row: any) =>
      new relatedModel({ entity: relatedModel.entity, data: row }) as InstanceType<T>
    );
  }

  /**
   * BelongsToMany relationship (many-to-many via pivot table)
   *
   * @example
   * ```typescript
   * // Simple (infers keys from table names)
   * async tags() {
   *   return this.belongsToMany(Tag, postTagsTable);
   * }
   *
   * // With field selection
   * async tags() {
   *   return this.belongsToMany(Tag, postTagsTable, {
   *     select: ['id', 'name', 'slug']
   *   });
   * }
   *
   * // With custom keys
   * async tags() {
   *   return this.belongsToMany(Tag, postTagsTable, {
   *     foreignKey: 'postId',      // key in pivot table
   *     otherKey: 'tagId',         // key in pivot table
   *     localKey: 'id',            // key in this model
   *     relatedKey: 'id'           // key in related model
   *   });
   * }
   *
   * // With ordering
   * async tags() {
   *   return this.belongsToMany(Tag, postTagsTable, {
   *     orderBy: 'name',
   *     orderDirection: 'asc'
   *   });
   * }
   * ```
   */
  protected async belongsToMany<T extends typeof BaseModel>(
    relatedModel: T,
    pivotTable: SQLiteTable,
    options?: {
      foreignKey?: string;    // Key in pivot table for this model (default: {entity}Id)
      otherKey?: string;      // Key in pivot table for related model (default: {relatedEntity}Id)
      localKey?: string;      // Primary key in this model (default: primaryKey)
      relatedKey?: string;    // Primary key in related model (default: relatedModel.primaryKey)
      select?: string[];      // Fields to select from related model
      orderBy?: string;       // Field to order by
      orderDirection?: 'asc' | 'desc';
      withPivot?: string[];   // Additional pivot fields to include
      driver?: DbDriver;
    }
  ): Promise<InstanceType<T>[]> {
    const ModelClass = this.constructor as typeof BaseModel;
    const localKey = options?.localKey || ModelClass.primaryKey;
    const localValue = this.get(localKey);

    if (!localValue) {
      return [];
    }

    const driver = options?.driver || getDriver();
    const db = driver.getDb();

    // Infer keys from model names if not provided
    const foreignKey = options?.foreignKey || `${ModelClass.entity.toLowerCase()}Id`;
    const otherKey = options?.otherKey || `${relatedModel.entity.toLowerCase()}Id`;
    const relatedKey = options?.relatedKey || relatedModel.primaryKey;

    // Get IDs from pivot table
    const pivotFkColumn = (pivotTable as any)[foreignKey];
    const pivotOtherColumn = (pivotTable as any)[otherKey];

    if (!pivotFkColumn || !pivotOtherColumn) {
      throw new Error(`Keys ${foreignKey} or ${otherKey} not found in pivot table`);
    }

    const pivotRows = await db
      .select()
      .from(pivotTable)
      .where(eq(pivotFkColumn, localValue));

    if (pivotRows.length === 0) {
      return [];
    }

    // Get related IDs from pivot
    const relatedIds = pivotRows.map((row: any) => row[otherKey]);

    if (relatedIds.length === 0) {
      return [];
    }

    // Fetch related records
    const relatedTable = relatedModel.getTable();
    const relatedPkColumn = (relatedTable as any)[relatedKey];

    if (!relatedPkColumn) {
      throw new Error(`Primary key ${relatedKey} not found in ${relatedModel.entity}`);
    }

    let query = db.select().from(relatedTable);

    // Apply field selection if specified
    if (options?.select && options.select.length > 0) {
      const selectObj: any = {};
      for (const field of options.select) {
        const column = (relatedTable as any)[field];
        if (column) {
          selectObj[field] = column;
        }
      }
      query = db.select(selectObj).from(relatedTable);
    }

    query = query.where(inArray(relatedPkColumn, relatedIds));

    // Apply ordering
    if (options?.orderBy) {
      const orderColumn = (relatedTable as any)[options.orderBy];
      if (orderColumn) {
        query = query.orderBy(
          options.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)
        );
      }
    }

    const results = await query;

    // Optionally attach pivot data
    if (options?.withPivot && options.withPivot.length > 0) {
      return results.map((row: any) => {
        const instance = new relatedModel({ entity: relatedModel.entity, data: row }) as InstanceType<T>;

        // Find matching pivot row
        const pivotRow = pivotRows.find((pr: any) => pr[otherKey] === row[relatedKey]);

        if (pivotRow) {
          const pivotData: any = {};
          for (const field of options.withPivot!) {
            if (field in pivotRow) {
              pivotData[field] = pivotRow[field];
            }
          }
          // Store pivot data in a special property
          (instance as any)._pivot = pivotData;
        }

        return instance;
      });
    }

    return results.map((row: any) =>
      new relatedModel({ entity: relatedModel.entity, data: row }) as InstanceType<T>
    );
  }

  /**
   * HasOne relationship (one-to-one)
   *
   * @example
   * ```typescript
   * async profile() {
   *   return this.hasOne(Profile, 'userId');
   * }
   * ```
   */
  protected async hasOne<T extends typeof BaseModel>(
    relatedModel: T,
    foreignKey: string,
    options?: {
      localKey?: string;
      select?: string[];
      driver?: DbDriver;
    }
  ): Promise<InstanceType<T> | null> {
    const results = await this.hasMany(relatedModel, foreignKey, {
      ...options,
      limit: 1
    });

    return results.length > 0 ? results[0] : null;
  }
}
