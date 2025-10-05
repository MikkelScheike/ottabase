# @ottabase/db

Shared Prisma database client and schema configuration for Ottabase applications.

## Features

- Global Prisma client with development-time singleton pattern
- Modular core schemas for selective inclusion
- Prisma configuration utilities for apps
- Type-safe database operations
- Schema concatenation system integration

## Installation

This package is automatically available in the monorepo. No additional installation required.

## Setup

1. Set `DATABASE_URL` in your environment (e.g., `.env` file):

   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/database"
   ```

2. Configure your app's Prisma schema in `ottabase/prisma/prisma.config.js`:

   ```javascript
   const { definePrismaConfig } = require("@ottabase/db/prisma");

   module.exports = definePrismaConfig({
     coreSchemas: ["user"],      // Select core schemas
     provider: "postgresql",     // Database provider
   });
   ```

3. Generate the Prisma client:
   ```bash
   pnpm db:generate  # From app directory
   ```

## Usage

### Basic Database Operations

```typescript
import { prisma } from '@ottabase/db';

// Use the global Prisma client
const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: {
    email: 'user@example.com'
  }
});
```

### Type Exports

```typescript
import { PrismaClient } from '@ottabase/db';

// Access Prisma types
type User = Prisma.UserCreateInput;
```

### Prisma Configuration

```javascript
import { definePrismaConfig } from '@ottabase/db/prisma';

export default definePrismaConfig({
  coreSchemas: ["user", "post"],  // Available: "user", "post"
  provider: "postgresql",         // postgresql, mysql, sqlite, etc.
  appSchemaPath: "ottabase/prisma/app.schema.prisma",
  outputSchemaPath: "prisma/schema.prisma",
});
```

## Core Schemas

Available modular schemas in [`prisma/schemas/`](prisma/schemas/):

- **`user`** - User authentication and management
- **`post`** - Blog posts and content management

### Adding New Core Schemas

1. Create a new `.schema.prisma` file in `prisma/schemas/`
2. Add only model definitions (no generator/datasource)
3. Update `CoreSchemaName` type in `prisma/schemas/index.ts`
4. Update the README in `prisma/schemas/README.md`

## Scripts

Run these commands from the monorepo root:

- `pnpm --filter @ottabase/db build` – Build the package
- `pnpm --filter @ottabase/db prisma:generate` – Generate Prisma client (for testing)

For app-specific operations, use the app's `pnpm db:generate` command.

## Environment Variables

- `DATABASE_URL` – Database connection string (required)

## Package Structure

```
packages/db/
├── prisma/
│   ├── schemas/         # Modular core schemas
│   │   ├── base.schema.prisma
│   │   ├── user.schema.prisma
│   │   ├── post.schema.prisma
│   │   ├── index.ts     # CoreSchemaName type
│   │   └── README.md
│   └── README.md        # Schema documentation
├── src/
│   ├── client.ts        # Global Prisma client
│   ├── prisma-config.ts # Configuration utilities
│   └── index.ts         # Main exports
└── README.md
```

## Exports

```json
{
  ".": "./dist/index.js",           // Main exports (PrismaClient, prisma)
  "./client": "./dist/client.js",   // Direct client access
  "./prisma": "./dist/prisma-config.js", // Configuration utilities
  "./schema": "./prisma/schema.prisma"   // Legacy schema access
}
```

## Benefits

- **Global singleton**: Prevents multiple Prisma client instances in development
- **Modular schemas**: Apps include only needed models
- **Type safety**: Full TypeScript support with generated types
- **Monorepo ready**: Easily shareable across apps and packages
- **Flexible configuration**: Support for multiple database providers
- **Schema concatenation**: Automatic schema generation via `@ottabase/scripts`
