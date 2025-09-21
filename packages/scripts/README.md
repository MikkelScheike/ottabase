# @ottabase/scripts

Utility scripts for the Ottabase monorepo.

## Features

- **Dynamic Prisma Schema**: Automatically concatenates core schema with app-specific schemas
- **Simple Configuration**: Minimal setup required
- **Extensible**: Easy to add app-specific models while sharing core schema

## Usage

### 1. App Configuration

Create `ottabase/prisma/prisma.config.ts` in your app:

```typescript
import { definePrismaConfig } from "@ottabase/scripts/prisma";

export default definePrismaConfig({
  includeOttabaseSchema: true,           // Include @ottabase/db core schema (default: true)
  appSchemaPath: "app.schema.prisma",    // App-specific schema file (default: 'app.schema.prisma')
  outputSchemaPath: "prisma/schema.prisma", // Output schema file (default: 'prisma/schema.prisma')
});
```

### 2. App Schema

Create `ottabase/prisma/app.schema.prisma` with your app-specific models:

```prisma
// App-specific models
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Extend core User model with relations
model User {
  posts Post[]
}
```

### 3. Generate Schema

Run the script to concatenate schemas and generate Prisma client:

```bash
# From your app directory
npx db-prisma-schema-concatenate

# Or from monorepo root
pnpm --filter your-app db:generate
```

### 4. App Package.json Script

Add to your app's `package.json`:

```json
{
  "scripts": {
    "db:generate": "db-prisma-schema-concatenate"
  }
}
```

## How It Works

1. **Reads Configuration**: Loads `ottabase/prisma/prisma.config.ts` (or `.js`) from your app
2. **Concatenates Schemas**: Combines core schema from `@ottabase/db` with your app schema
3. **Generates Output**: Creates `prisma/schema.prisma` with combined schema and timestamp
4. **Runs Prisma Generate**: Automatically generates the Prisma client

## Example Structure

```text
apps/my-app/
├── ottabase/prisma/
│   ├── prisma.config.ts      # Configuration (supports .js and .ts)
│   └── app.schema.prisma     # App-specific models
├── prisma/
│   ├── _info.txt            # Warning not to edit here
│   └── schema.prisma        # Generated (do not edit, auto-ignored by git)
├── .gitignore               # Includes prisma/schema.prisma
└── package.json
```

## Benefits

- **Shared Core Models**: All apps share the same core database models
- **App-Specific Extensions**: Each app can add its own models and relations
- **Type Safety**: Full TypeScript support with generated types
- **Simple Workflow**: One command generates everything
- **Extensible**: Easy to add new apps with their own schemas
- **Timestamp Tracking**: Generated schemas include creation timestamp
- **Git Integration**: Generated files are automatically ignored
- **TypeScript Config Support**: Configuration files can be `.ts` or `.js`

## API

### `concatenatePrismaSchema(cwd?: string)`

Programmatically concatenate schemas and generate Prisma client.

```typescript
import { concatenatePrismaSchema } from '@ottabase/scripts';

await concatenatePrismaSchema('./apps/my-app');
```

### `definePrismaConfig(config: PrismaConfig)`

Type-safe configuration helper.

```typescript
import { definePrismaConfig, PrismaConfig } from '@ottabase/scripts/prisma';

const config: PrismaConfig = definePrismaConfig({
  includeOttabaseSchema: true,
  appSchemaPath: 'custom.schema.prisma',
  outputSchemaPath: 'prisma/custom.prisma'
});
```

## Path Constants

The following path patterns are used internally (defined in `concatenate.ts`):

- **OTTABASE_CORE_SCHEMA_PATH**: `"packages/db/prisma/ottabase.schema.prisma"`
- **DEFAULT_APP_SCHEMA_PATH**: `"ottabase/prisma/app.schema.prisma"`
- **DEFAULT_OUTPUT_SCHEMA_PATH**: `"prisma/schema.prisma"`
- **PRISMA_CONFIG_PATH**: `"ottabase/prisma/prisma.config.js"` (supports `.ts`)

These constants make it easy for developers to understand the expected file locations.
