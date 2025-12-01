# @ottabase/db

Shared Prisma database layer for Ottabase applications.

## Quick Start

```typescript
// 1. Configure (apps/your-app/db.config.ts)
import { defineAppDbConfig } from "@ottabase/db";

export default defineAppDbConfig({
  appId: "your-app",
  features: ["auth"], // Enable feature packages
});

// 2. Generate schema + Prisma client
// pnpm db:generate

// 3. Generate migration
// pnpm db:migrate --name=initial

// 4. Use in Cloudflare Worker
import { createPrismaD1Client } from "@ottabase/cf/d1-prisma";

const prisma = createPrismaD1Client(env.DB);
const users = await prisma.user.findMany();
```

## Exports

| Import                   | Function                                        |
| ------------------------ | ----------------------------------------------- |
| `@ottabase/db`           | `defineAppDbConfig()`, `PrismaClient`           |
| `@ottabase/db/registry`  | `registerFeature()`, `defineFeatureSchema()`    |
| `@ottabase/cf/d1-prisma` | `createPrismaD1Client()`, `getPrismaD1Client()` |

## Package Separation

- **`@ottabase/db`**: Database layer (Prisma ORM, schema config, feature registry)
- **`@ottabase/cf`**: Cloudflare bindings (D1, KV, R2, Queues, etc.)

This separation keeps the database layer framework-agnostic while providing
Cloudflare-specific functionality in a dedicated package.

## Full Documentation

See [docs/OTTABASE_DB.MD](../../docs/OTTABASE_DB.MD) for complete documentation.
