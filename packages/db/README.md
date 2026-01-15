# @ottabase/db

Shared database layer for Ottabase applications using Drizzle ORM.

## Drizzle (Cloudflare D1)

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

| Import                    | Function                                           |
| ------------------------- | -------------------------------------------------- |
| `@ottabase/db`            | Shared types                                       |
| `@ottabase/db/drizzle`    | `BaseDbDriver`, `DbDriver` interfaces              |
| `@ottabase/db/drizzle-d1` | `createD1Driver()`, `D1Driver` for Cloudflare D1   |

## Package Separation

- **`@ottabase/db`**: Database layer (Drizzle support)
- **`@ottabase/cf`**: Cloudflare bindings (D1, KV, R2, Queues, etc.)

This separation keeps the database layer modular while providing
runtime-specific functionality in dedicated packages.

