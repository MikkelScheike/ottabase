# Ottabase Core Schemas

This directory contains modular Prisma schema files that can be selectively included in applications.

## Available Schemas

### Base Configuration

- **`base.schema.prisma`** - Contains generator and datasource configuration (required for all apps)

### Model Schemas

- **`user.schema.prisma`** - User authentication and management model
- **`post.schema.prisma`** - Blog posts and content management model

## Usage

Apps can selectively include schemas in their `prisma.config.ts`:

```typescript
import { definePrismaConfig } from "@ottabase/scripts/prisma";

export default definePrismaConfig({
  // Select which core schemas to include
  coreSchemas: ["user", "post"],

  // Configure database provider
  provider: "postgresql", // or "mysql", "sqlite", etc.

  // App-specific schema
  appSchemaPath: "ottabase/prisma/app.schema.prisma",

  // Output location
  outputSchemaPath: "prisma/schema.prisma",
});
```

## Adding New Core Schemas

1. Create a new `.schema.prisma` file in this directory
2. Include only model definitions (no generator/datasource)
3. Add descriptive comments
4. Update the `CoreSchemaName` type in [`index.ts`](index.ts:9) in this directory
5. Update this README with the new schema

## Notes

- The `base.schema.prisma` is always included and provides generator/datasource configuration
- Model schemas should only contain model definitions
- The concatenation script will merge selected schemas into a single `schema.prisma` file
