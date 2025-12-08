# @ottabase/db

Shared database layer for Ottabase applications with support for multiple ORMs.

## Choose Your ORM

### Prisma (Traditional Databases)

Best for traditional databases (PostgreSQL, MySQL, etc.) and existing Prisma workflows.

```typescript
// 1. Configure (apps/your-app/db.config.ts)
import { defineAppDbConfig } from "@ottabase/db/prisma";

export default defineAppDbConfig({
  appId: "your-app",
  features: ["auth"], // Enable feature packages
});

// 2. Generate schema + Prisma client
// pnpm db:generate

// 3. Use in Cloudflare Worker with D1
import { createPrismaD1Client } from "@ottabase/cf/d1-prisma";

const prisma = createPrismaD1Client(env.DB);
const users = await prisma.user.findMany();
```

### Drizzle (Recommended for Cloudflare D1)

Best for Cloudflare D1 and modern edge deployments with better type safety and performance.

```typescript
// 1. Use in Cloudflare Worker with D1
import { createD1Driver } from "@ottabase/db/drizzle-d1";

const driver = createD1Driver(env.DB);
const db = driver.getDb();

// Use with your Drizzle schema
const users = await db.select().from(usersTable);
```

## Exports

| Import                    | Function                                           | ORM     |
| ------------------------- | -------------------------------------------------- | ------- |
| `@ottabase/db`            | Shared types only (ORM-agnostic)                   | N/A     |
| `@ottabase/db/prisma`     | `defineAppDbConfig()`, `prisma`, registry          | Prisma  |
| `@ottabase/db/drizzle`    | `BaseDbDriver`, `DbDriver` interfaces              | Drizzle |
| `@ottabase/db/drizzle-d1` | `createD1Driver()`, `D1Driver` for Cloudflare D1   | Drizzle |
| `@ottabase/cf/d1-prisma`  | `createPrismaD1Client()` for Prisma + D1           | Prisma  |

## Tree Shaking

The package is designed for optimal tree shaking:

- **Prisma-only apps**: Import from `@ottabase/db/prisma` - Drizzle code is not bundled
- **Drizzle-only apps**: Import from `@ottabase/db/drizzle-d1` - Prisma code is not bundled
- Both ORMs are **peer dependencies** marked as optional
- Each ORM has a separate entry point with no cross-dependencies

## Package Separation

- **`@ottabase/db`**: ORM-agnostic database layer (Prisma and Drizzle support)
- **`@ottabase/cf`**: Cloudflare bindings (D1, KV, R2, Queues, etc.)

This separation keeps the database layer modular while providing
runtime-specific functionality in dedicated packages.

## Full Documentation

See [docs/OTTABASE_DB.MD](../../docs/OTTABASE_DB.MD) for complete documentation.
