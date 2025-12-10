# @ottabase/ottaorm

Laravel Eloquent-inspired ORM for Cloudflare D1 and SQLite. Fat model pattern with all logic in one place.

## Features

- **Fat Models** - All metadata, validation, relationships in model class
- **Global Driver** - Set once, use everywhere (no driver passing)
- **Eloquent-like API** - `Model.find()`, `Model.where()`, `Model.create()`
- **Type-Safe** - Full TypeScript support with Drizzle ORM
- **Relationships** - belongsTo, hasMany, hasOne, belongsToMany
- **Migrations** - Core + per-app migration system
- **Field Metadata** - UI config, validation, form/table config
- **Type Casting** - Automatic boolean, date, json conversion

## Installation

```bash
pnpm add @ottabase/ottaorm @ottabase/db drizzle-orm
```

## D1 Database Setup

### Local Development

Ottabase uses Cloudflare D1 (SQLite) for data storage. Local development works without a Cloudflare account.

#### 1. Configure D1 Binding

Add D1 binding to your `wrangler.jsonc`:

```jsonc
{
  "name": "your-app",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding: "OBCF_D1",                    // Accessible as env.OBCF_D1 in your code
      "database_name": "your-app-db",     // Database name for CLI
      "database_id": "local"              // Use "local" for dev, replace for prod
    }
  ]
}
```

#### 2. Local Database Location

Wrangler automatically creates a local SQLite database in:

```
.wrangler/state/v3/d1/
```

**Note**: This directory is auto-managed and git-ignored.

#### 3. Run Migrations

Create database tables by running migrations via your API:

**Development (no auth required):**
```bash
# Start dev server
pnpm dev

# Initialize database (runs migrations)
curl -X POST http://localhost:3000/api/ottaorm/init
```

**Production (requires secret):**
```bash
# Using query parameter
curl -X POST https://your-app.workers.dev/api/ottaorm/init?secret=your-secret

# Using body parameter
curl -X POST https://your-app.workers.dev/api/ottaorm/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret"}'

# Using Authorization header
curl -X POST https://your-app.workers.dev/api/ottaorm/init \
  -H "Authorization: Bearer your-secret"
```

**Set the secret in wrangler.jsonc:**
```jsonc
{
  "vars": {
    "ENVIRONMENT": "production",
    "MIGRATION_SECRET": "your-strong-secret-here"
  }
}
```

Or use the migration API directly in your code:

```typescript
import { runMigrations, coreMigrations } from "@ottabase/ottaorm";
import { createD1Driver } from "@ottabase/db/drizzle-d1";

const driver = createD1Driver(env.OBCF_D1);
await runMigrations(driver, coreMigrations);
```

### Production Setup

#### 1. Create D1 Database

```bash
# Create production database
wrangler d1 create your-app-db

# Wrangler outputs:
# database_id = "abc123-def456-ghi789"
```

#### 2. Update wrangler.jsonc

Replace `database_id` with your production ID:

```jsonc
{
  "d1_databases": [
    {
      "binding: "OBCF_D1",
      "database_name": "your-app-db",
      "database_id": "abc123-def456-ghi789"  // ← Your production ID
    }
  ]
}
```

#### 3. Deploy & Run Migrations

```bash
# Deploy your app
pnpm deploy

# Run migrations via deployed API
curl -X POST https://your-app.workers.dev/api/ottaorm/init
```

### Environment Variables

No environment variables needed! D1 binding is configured via `wrangler.jsonc` and accessed as `env.OBCF_D1`.

#### Next.js on Cloudflare (using @opennextjs/cloudflare)

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const { env } = getCloudflareContext();
  // env.OBCF_D1 is your D1 database binding
  const driver = createD1Driver(env.OBCF_D1);
  setDriver(driver);
}
```

#### Cloudflare Workers

```typescript
export default {
  async fetch(request: Request, env: Env) {
    // env.OBCF_D1 is your D1 database binding
    const driver = createD1Driver(env.OBCF_D1);
    setDriver(driver);
  }
}
```

### Inspecting Your Database

#### View Tables

```bash
# Local
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# Production
wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

#### Query Data

```bash
# Local
wrangler d1 execute DB --local --command="SELECT * FROM users"

# Production
wrangler d1 execute DB --remote --command="SELECT * FROM users LIMIT 10"
```

#### Reset Local Database

```bash
# Delete local database
rm -rf .wrangler/state/v3/d1/

# Re-run migrations
curl -X POST http://localhost:3000/api/ottaorm/init
```

### Cloudflare Recommendations

✅ **Do:**
- Use migrations for schema changes (version controlled)
- Test migrations locally before deploying to production
- Use `--local` flag for all local development
- Keep local and production schemas in sync

❌ **Don't:**
- Manually edit D1 schema in production (use migrations)
- Commit `.wrangler/` directory (always git-ignored)
- Use transactions (D1 doesn't support them yet)
- Run heavy migrations during peak traffic

### Multiple Environments

Use different `database_id` values per environment:

```jsonc
// wrangler.dev.jsonc (local/staging)
{
  "d1_databases": [{ "database_id": "dev-123" }]
}

// wrangler.prod.jsonc (production)
{
  "d1_databases": [{ "database_id": "prod-456" }]
}
```

Deploy with environment-specific config:

```bash
# Staging
wrangler deploy --config wrangler.dev.jsonc

# Production
wrangler deploy --config wrangler.prod.jsonc
```

## Quick Start

```typescript
import { setDriver } from "@ottabase/ottaorm";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { User, Post } from "@ottabase/ottaorm";

// Set driver once (e.g., in middleware)
const driver = createD1Driver(env.OBCF_D1);
setDriver(driver);

// Use models anywhere without passing driver
const user = await User.find("user-id");
const posts = await Post.where({ published: true });
const newPost = await Post.create({
  title: "Hello World",
  slug: "hello-world",
  authorId: user.id
});
```

## Fat Model Pattern

Everything in one class - schema, validation, relationships, custom methods:

```typescript
import { BaseModel } from "@ottabase/ottaorm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. Define table schema
export const todosTable = sqliteTable("todos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
  userId: text("user_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

// 2. Define model class
export class Todo extends BaseModel {
  static entity = "todos";
  static table = todosTable;
  static primaryKey = "id";

  // Type casting
  static casts = {
    completed: 'boolean' as const,
    createdAt: 'date' as const,
    updatedAt: 'date' as const,
  };

  // Default values
  protected static defaults = {
    completed: false,
  };

  // Field metadata (for UI generation)
  protected static fields = {
    title: {
      type: 'string',
      editable: true,
      searchable: true,
      sortable: true,
      uiConfig: {
        label: 'Title',
        placeholder: 'What needs to be done?',
      },
      validation: {
        rules: "required",
        messages: {
          required: "Title is required",
        }
      }
    },
    // ... more fields
  };

  // Relationships
  async user(select?: string[]) {
    const { User } = await import("@ottabase/ottaorm");
    return this.belongsTo(User, 'userId', { select });
  }

  // Custom methods
  static async incomplete() {
    return this.where({ completed: false });
  }

  async toggle() {
    this.set('completed', !this.get('completed'));
    return this.save();
  }
}
```

## CRUD Operations

### Creating Records

```typescript
// Create single record
const todo = await Todo.create({
  title: "Buy groceries",
  userId: "user-123"
});

// Create multiple records
const todos = await Todo.createMany([
  { title: "Task 1" },
  { title: "Task 2" }
]);
```

### Reading Records

```typescript
// Find by primary key
const todo = await Todo.find("todo-id");

// Find or throw error
const todo = await Todo.findOrFail("todo-id");

// First record matching conditions
const todo = await Todo.first({ completed: false });

// All records
const todos = await Todo.all();

// Where conditions
const todos = await Todo.where({ completed: true });

// With ordering
const todos = await Todo.where({ userId: "user-123" }, {
  orderBy: 'createdAt',
  orderDirection: 'desc'
});

// Pagination
const result = await Todo.paginate({
  page: 1,
  perPage: 10,
  orderBy: 'createdAt',
  orderDirection: 'desc'
});
// result = { data: Todo[], meta: { total, page, perPage, totalPages } }
```

### Updating Records

```typescript
// Update via instance
const todo = await Todo.find("todo-id");
todo.set('title', "Updated title");
await todo.save();

// Update multiple fields
todo.fill({ title: "New title", completed: true });
await todo.save();

// Static update
await Todo.update("todo-id", { completed: true });
```

### Deleting Records

```typescript
// Delete instance
const todo = await Todo.find("todo-id");
await todo.delete();

// Static delete
await Todo.destroy("todo-id");
```

## Relationships

### belongsTo (N:1)

```typescript
export class Post extends BaseModel {
  async author(select?: string[]) {
    const { User } = await import("./User");
    return this.belongsTo(User, 'authorId', { select });
  }
}

// Usage
const post = await Post.find("post-id");
const author = await post.author(['id', 'name', 'email']);
```

### hasMany (1:N)

```typescript
export class User extends BaseModel {
  async posts(options?: {
    select?: string[];
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
  }) {
    const { Post } = await import("./Post");
    return this.hasMany(Post, 'authorId', options);
  }
}

// Usage
const user = await User.find("user-id");
const posts = await user.posts({
  select: ['id', 'title', 'createdAt'],
  orderBy: 'createdAt',
  orderDirection: 'desc',
  limit: 10
});
```

### hasOne (1:1)

```typescript
export class User extends BaseModel {
  async profile() {
    const { Profile } = await import("./Profile");
    return this.hasOne(Profile, 'userId');
  }
}

// Usage
const user = await User.find("user-id");
const profile = await user.profile();
```

### belongsToMany (N:M)

```typescript
export class Post extends BaseModel {
  async tags(options?: {
    select?: string[];
    orderBy?: string;
    withPivot?: string[];
  }) {
    const { Tag } = await import("./Tag");
    return this.belongsToMany(Tag, postTagsTable, {
      foreignKey: 'postId',
      otherKey: 'tagId',
      ...options
    });
  }
}

// Usage
const post = await Post.find("post-id");
const tags = await post.tags({
  select: ['id', 'name', 'slug'],
  withPivot: ['createdAt']
});
```

## Migrations

### Core Migrations (from package)

```typescript
import { runMigrations, coreMigrations } from "@ottabase/ottaorm";
import { createD1Driver } from "@ottabase/db/drizzle-d1";

const driver = createD1Driver(env.OBCF_D1);

// Run core migrations (User, Post, Tag tables)
await runMigrations(driver, coreMigrations);
```

### Per-App Migrations

Create your app migrations:

```typescript
// ottabase/migrations/index.ts
import type { Migration } from "@ottabase/ottaorm";

export const appMigrations: Migration[] = [
  {
    name: '001_create_todos_table',
    up: async (db) => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          user_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    },
    down: async (db) => {
      await db.execute(`DROP TABLE IF EXISTS todos`);
    }
  }
];
```

Run core + app migrations together:

```typescript
import { runMigrations, coreMigrations } from "@ottabase/ottaorm";
import { appMigrations } from "./ottabase/migrations";

// Run all migrations
const result = await runMigrations(driver, [
  ...coreMigrations,    // User, Account, Post, Tag
  ...appMigrations      // Todo
]);

console.log(`Executed: ${result.executed.length}`);
console.log(`Skipped: ${result.skipped.length}`);
```

### Rollback Migrations

```typescript
import { rollbackMigrations } from "@ottabase/ottaorm";

// Rollback last migration
await rollbackMigrations(driver, [...coreMigrations, ...appMigrations], {
  steps: 1
});

// Rollback all migrations
await rollbackMigrations(driver, [...coreMigrations, ...appMigrations]);
```

## Type Casting

Automatic type conversion:

```typescript
export class Todo extends BaseModel {
  static casts = {
    completed: 'boolean' as const,      // INTEGER -> boolean
    createdAt: 'date' as const,         // INTEGER -> Date
    updatedAt: 'date' as const,
    metadata: 'json' as const,          // TEXT -> object
    tags: 'array' as const,             // TEXT -> array
  };
}

const todo = await Todo.find("todo-id");
console.log(typeof todo.get('completed')); // "boolean"
console.log(todo.get('createdAt'));        // Date object
```

## Field Metadata

Define field metadata for UI generation:

```typescript
protected static fields = {
  title: {
    type: 'string',
    editable: true,
    searchable: true,
    sortable: true,
    uiConfig: {
      label: 'Title',
      description: 'Todo title',
      placeholder: 'What needs to be done?',
    },
    formConfig: {
      visible: true,
      fieldType: 'input',
    },
    tableConfig: {
      visible: true,
      colWidth: 'auto',
    },
    validation: {
      rules: "required",
      messages: {
        required: "Title is required",
      }
    }
  }
};

// Access field metadata
const fields = Todo.getFields();
console.log(fields.title.uiConfig.label); // "Title"
```

## Complete Example: API Route

```typescript
// app/api/ottaorm/init/route.ts
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { runMigrations, coreMigrations } from "@ottabase/ottaorm";
import { appMigrations } from "../../../../ottabase/migrations";

export const runtime = "edge";

// Security check for production
async function checkAuth(request, env) {
  const isDev = env.ENVIRONMENT === 'development' || !env.ENVIRONMENT;
  if (isDev) return true;

  // Production: require secret
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') ||
                 request.headers.get('authorization')?.replace('Bearer ', '');

  return secret === env.MIGRATION_SECRET;
}

export async function POST(request) {
  const { env } = getCloudflareContext();

  // Check authentication
  if (!await checkAuth(request, env)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const driver = createD1Driver(env.OBCF_D1);

  const result = await runMigrations(driver, [
    ...coreMigrations,
    ...appMigrations
  ]);

  return NextResponse.json({
    success: true,
    executed: result.executed,
    skipped: result.skipped,
  });
}
```

```typescript
// app/api/ottaorm/todos/route.ts
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createD1Driver } from "@ottabase/db/drizzle-d1";
import { setDriver } from "@ottabase/ottaorm";
import { Todo } from "../../../../ottabase/models/Todo";

export const runtime = "edge";

export async function GET() {
  const { env } = getCloudflareContext();
  setDriver(createD1Driver(env.OBCF_D1));

  const todos = await Todo.all();

  return NextResponse.json({
    todos: todos.map(t => t.toJson())
  });
}

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  setDriver(createD1Driver(env.OBCF_D1));

  const body = await request.json();
  const todo = await Todo.create(body);

  return NextResponse.json({
    todo: todo.toJson()
  });
}
```

## Core Models

The package includes these core models:

- **User** - Users with name, email, image
- **Account** - NextAuth provider accounts (OAuth, credentials)
- **Post** - Blog posts with title, slug, content, author
- **Tag** - Tags with name and slug
- **Post_Tags** - Many-to-many pivot table for posts and tags

## Architecture

```
@ottabase/ottaorm
├── src/
│   ├── base/
│   │   └── BaseModel.ts          # Fat model base class
│   ├── models/
│   │   ├── User.ts               # Core User model
│   │   ├── Account.ts            # Core Account model (NextAuth)
│   │   ├── Post.ts               # Core Post model
│   │   └── Tag.ts                # Core Tag model
│   ├── migrations/
│   │   └── index.ts              # Migration system + core migrations
│   ├── context.ts                # Global driver management
│   └── index.ts                  # Main exports

Your App
├── ottabase/
│   ├── models/
│   │   └── Todo.ts               # App-specific model
│   └── migrations/
│       └── index.ts              # App-specific migrations
└── app/api/ottaorm/
    ├── init/route.ts             # Run migrations
    └── todos/route.ts            # Todo CRUD API
```

## Benefits

- **Simple** - No complex configuration, just set driver and use models
- **Type-Safe** - Full TypeScript with IDE autocomplete
- **Self-Contained** - Each model has everything in one place
- **Extensible** - Easy to add custom methods and relationships
- **Familiar** - Laravel Eloquent-like API developers know
- **Cloudflare-First** - Built specifically for D1 and Edge runtime

## License

MIT
