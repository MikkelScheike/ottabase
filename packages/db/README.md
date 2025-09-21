# @ottabase/db

Shared Prisma database client for Ottabase applications.

## Features

- Global Prisma client with development-time singleton pattern
- Shared schema across the monorepo
- Simple setup and usage
- Type-safe database operations

## Installation

This package is automatically available in the monorepo. No additional installation required.

## Setup

1. Set `DATABASE_URL` in your environment (e.g., `.env` file):

   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/database"
   ```

2. Generate the Prisma client:
   ```bash
   pnpm --filter @ottabase/db prisma:generate
   ```

## Usage

### Basic Usage

```typescript
import { prisma } from '@ottabase/db';

// Use the global Prisma client
const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: {
    email: 'user@example.com'0
  }
});
```

### Type Exports

```typescript
import { PrismaClient } from '@ottabase/db';

// Access Prisma types
type User = Prisma.UserCreateInput;
```

## Schema

The Prisma schema is located at [`prisma/schema.prisma`](prisma/schema.prisma:1) and can be accessed via:

```typescript
// Access schema file directly
import schema from '@ottabase/db/schema';
```

## Scripts

Run these commands from the monorepo root:

- `pnpm --filter @ottabase/db prisma:generate` – Generate Prisma client
- `pnpm --filter @ottabase/db prisma:push` – Push schema to database
- `pnpm --filter @ottabase/db prisma:migrate:dev -- --name <name>` – Create migration
- `pnpm --filter @ottabase/db build` – Build the package

## Environment Variables

- `DATABASE_URL` – Database connection string (required)

## Package Structure

```
packages/db/
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── client.ts        # Global Prisma client
│   └── index.ts         # Main exports
└── README.md
```

## Benefits

- **Global singleton**: Prevents multiple Prisma client instances in development
- **Type safety**: Full TypeScript support with generated types
- **Monorepo ready**: Easily shareable across apps and packages
- **Simple setup**: Minimal configuration required
