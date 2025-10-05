# Ottabase Database Schemas

This directory contains modular Prisma schema files for the Ottabase database layer.

## Directory Structure

```
prisma/
├── schemas/              # Modular schema files
│   ├── base.schema.prisma
│   ├── user.schema.prisma
│   ├── post.schema.prisma
│   └── README.md
└── README.md            # This file
```

## Modular Schemas

The modular schemas in the [`schemas/`](schemas/) directory allow you to:

- **Select specific models** - Include only what your app needs
- **Configure providers** - Easily switch between databases
- **Maintain clarity** - Each model in its own file

### Usage

In your app's `prisma.config.js`:

```javascript
const { definePrismaConfig } = require("@ottabase/db/prisma");

module.exports = definePrismaConfig({
  coreSchemas: ["user", "post"],  // Select which schemas to include
  provider: "postgresql",          // Configure database provider
});
```

See [`schemas/README.md`](schemas/README.md) for more details.

## Adding New Models

To add new models to the core schemas:

1. Create a new file in `schemas/` (e.g., `comment.schema.prisma`)
2. Add only model definitions (no generator/datasource)
3. Update the `CoreSchemaName` type in `@ottabase/db/src/prisma-config.ts`
4. Update the documentation in `schemas/README.md`

## Learn More

- [Modular Schemas Documentation](schemas/README.md)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [@ottabase/scripts README](../../scripts/README.md)
