# Package Creation Guide for Ottabase Monorepo

This guide documents the learnings and best practices for creating packages in the Ottabase monorepo, specifically for UI components and shared packages.

## Package Structure Standards

### 1. Directory Structure

```text
packages/
├── package-name/
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── src/
│   │   ├── index.ts (barrel exports)
│   │   ├── component-name.ts (atomic exports)
│   │   └── components/
│   │       ├── index.ts
│   │       ├── ComponentA.tsx
│   │       └── ComponentB.tsx
│   └── dist/ (generated)
```

### 2. Package.json Configuration

```json
{
    "name": "@ottabase/package-name",
    "version": "1.0.0",
    "description": "Package description",
    "main": "dist/index.js",
    "module": "dist/index.esm.js",
    "types": "dist/index.d.ts",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.esm.js",
            "require": "./dist/index.js"
        },
        "./component-name": {
            "types": "./dist/component-name.d.ts",
            "import": "./dist/component-name.esm.js",
            "require": "./dist/component-name.js"
        }
    },
    "files": [
        "dist",
        "README.md"
    ],
    "scripts": {
        "build": "tsup src/index.ts src/component-name.ts --format cjs,esm --dts --clean",
        "dev": "tsup src/index.ts src/component-name.ts --format cjs,esm --dts --watch",
        "clean": "rimraf dist",
        "lint": "eslint src --ext .ts,.tsx",
        "type-check": "tsc --noEmit"
    },
    "dependencies": {
        "@ottabase/config": "workspace:*"
    },
    "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
    },
    "devDependencies": {
        "typescript": "catalog:",
        "tsup": "catalog:",
        "rimraf": "catalog:",
        "eslint": "catalog:"
    }
}
```

### 3. TypeScript Configuration

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.*", "**/*.spec.*"]
}
```

**Key Points:**

- Remove `rootDir` to avoid cross-package import issues
- Add `skipLibCheck: true` for workspace dependencies
- Use `jsx: "react-jsx"` for React 17+ JSX transform

## Atomic Imports & Tree Shaking

### Implementation Strategy

1. **Create individual entry files** for each component:

```typescript
// src/component-name.ts
export { default as ComponentName } from './components/ComponentName';
```

2. **Update package.json exports** for each atomic import:

```json
"./component-name": {
    "types": "./dist/component-name.d.ts",
    "import": "./dist/component-name.esm.js",
    "require": "./dist/component-name.js"
}
```

3. **Update build scripts** to include all entry points:

```json
"build": "tsup src/index.ts src/component-name.ts --format cjs,esm --dts --clean"
```

### Benefits

- **Better tree shaking**: Only specific components are bundled
- **Reduced bundle size**: Unused components are excluded
- **Faster builds**: Less code to process
- **Automatic chunking**: tsup creates shared chunks for common dependencies

### Usage Patterns

```typescript
// ✅ Atomic import (better tree shaking)
import { ComponentName } from '@ottabase/package-name/component-name';

// ✅ Barrel import (convenience, but imports all)
import { ComponentName } from '@ottabase/package-name';
```

## Tailwind Integration

### Consumer App Configuration

Apps consuming UI components must include the package source in Tailwind config:

```javascript
// tailwind.config.cjs
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        // Include package sources for UI components
        '../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/ui-core/src/**/*.{js,ts,jsx,tsx}'
    ]
};
```

**Critical**: Without this, Tailwind classes in package components won't be processed.

## Configuration Integration

### Using @ottabase/config Package

For components that need configuration:

```typescript
import { createAppConfig } from "@ottabase/config";

interface ComponentProps {
    appConfig?: ReturnType<typeof createAppConfig>;
    customValue?: string;
}

const Component: React.FC<ComponentProps> = ({
    appConfig,
    customValue
}) => {
    // Create default config if none provided
    const config = appConfig || createAppConfig();

    // Use config values as fallbacks
    const value = customValue || config.meta.someValue;

    return <div>{value}</div>;
};
```

### Benefits

- **Centralized configuration** via @ottabase/config
- **Flexible overrides** with direct props
- **Default fallbacks** from configuration
- **Type safety** with TypeScript

## Dependency Management

### Workspace Dependencies

```json
"dependencies": {
    "@ottabase/config": "workspace:*"
}
```

### Catalog Dependencies

```json
"dependencies": {
    "@mantine/core": "catalog:",
    "next-themes": "catalog:"
}
```

### Peer Dependencies

```json
"peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "next": ">=15.0.0"
}
```

**Key Rules:**

- Use `workspace:*` for internal packages
- Use `catalog:` for external packages in pnpm-workspace.yaml
- Declare peer dependencies for framework requirements

## Build & Development

### Build Process

1. **tsup** handles dual CJS/ESM output with TypeScript declarations
2. **Multiple entry points** for atomic imports
3. **Automatic chunking** for shared dependencies
4. **Type definitions** generated for all exports

### Development Workflow

```bash
# Install dependencies
pnpm install

# Type check
pnpm type-check

# Build package
pnpm build

# Watch mode for development
pnpm dev
```

## Common Pitfalls & Solutions

### 1. TypeScript Cross-Package Imports

**Problem**: `rootDir` errors when importing from other workspace packages
**Solution**: Remove `rootDir` and add `skipLibCheck: true`

### 2. Tailwind Classes Not Applied

**Problem**: Consumer app doesn't process package Tailwind classes
**Solution**: Add package source paths to consumer's tailwind.config.cjs

### 3. Configuration Import Issues

**Problem**: Hardcoded imports break flexibility
**Solution**: Use @ottabase/config with fallback patterns and optional config props

### 4. Peer Dependency Issues

**Problem**: Missing framework dependencies in package
**Solution**: Declare proper peer dependencies and dev dependencies

## Testing Integration

### Template App Testing

Add components to the template app for validation:

```typescript
// In apps/ottabase-template-app/app/page.tsx
import { ComponentName } from '@ottabase/ui-components/component-name';

// Demo in UI Components section
<ComponentName prop1="value" />
```

### Verification Checklist

- [ ] Package builds without errors
- [ ] Type checking passes
- [ ] Atomic imports work
- [ ] Tailwind styles apply
- [ ] Component renders in template app
- [ ] Configuration integration works

## Documentation Standards

### README Structure

1. **Component description** and purpose
2. **Props interface** with types and defaults
3. **Usage examples** (both atomic and barrel imports)
4. **Dependencies** and requirements
5. **Tree shaking benefits** explanation
6. **Available atomic imports** list

### Example Component Documentation

````markdown
### ComponentName

Brief description of component functionality.

#### Props
- `prop1: string` - Description (default: 'value')
- `prop2?: boolean` - Optional description

#### Usage
```tsx
// Atomic import (better tree shaking)
import { ComponentName } from '@ottabase/ui-components/component-name';

// Basic usage
<ComponentName prop1="value" />
````

This guide serves as the definitive reference for creating consistent, well-structured packages in the Ottabase monorepo.
